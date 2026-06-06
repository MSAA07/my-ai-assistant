<script>
  import { onDestroy, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { API_BASE } from '../../config.js';
  import { formatDate, formatNumber, t } from '../../lib/i18n/t.js';
  import { language } from '../../lib/stores/language.js';

  const statusMeta = {
    pass: { tone: 'success', labelKey: 'adminQA.status.pass' },
    fail: { tone: 'danger', labelKey: 'adminQA.status.fail' },
    skip: { tone: 'neutral', labelKey: 'adminQA.status.skip' }
  };

  const TOTAL_QA_TESTS = 18;
  const FILE_TYPE_PASS_ORDERS = [5, 7, 9, 11, 13];
  const EDGE_CASE_ORDERS = [14, 15];

  let target = 'staging';
  let running = false;
  let result = null;
  let progress = null;
  let progressRunStartedAt = 0;
  let progressReceivedAt = 0;
  let liveNow = Date.now();
  let error = '';
  let rateLimitMessage = '';
  let history = [];
  let historyLoading = true;
  let historyError = '';
  let expandedRunId = '';
  let progressInterval = null;
  let liveTimer = null;

  $: $language;
  $: hasFailures = Number(result?.failed || 0) > 0;
  $: liveElapsedMs = progress?.inProgress && progressRunStartedAt
    ? Math.max(0, liveNow - progressRunStartedAt)
    : 0;
  $: liveRemainingMs = progress?.inProgress
    ? Math.max(0, Number(progress.estimatedRemainingMs || 0) - Math.max(0, liveNow - progressReceivedAt))
    : 0;

  function formatDuration(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value)) return '-';
    return t('adminQA.durationMs', { duration: formatNumber(Math.max(0, Math.round(value))) });
  }

  function formatDurationShort(ms) {
    const value = Math.max(0, Math.round(Number(ms) || 0));
    const totalSeconds = Math.round(value / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes <= 0) return `${formatNumber(seconds)}s`;
    return `${formatNumber(minutes)}m ${formatNumber(seconds)}s`;
  }

  function formatCost(value) {
    const amount = Number(value);
    return `$${(Number.isFinite(amount) ? amount : 0).toFixed(4)}`;
  }

  function formatRunDate(value) {
    return value
      ? formatDate(value, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      : '-';
  }

  function getStatusMeta(status) {
    return statusMeta[status] || statusMeta.skip;
  }

  function getStatusLabel(status) {
    return t(getStatusMeta(status).labelKey);
  }

  function getRunResults(run) {
    return Array.isArray(run?.results) ? run.results : [];
  }

  function getPassedOrders(run) {
    return new Set(
      getRunResults(run)
        .filter((item) => item?.status === 'pass')
        .map((item) => Number(item?.order))
        .filter(Number.isFinite)
    );
  }

  function getRunMetrics(run) {
    const passedOrders = getPassedOrders(run);
    return {
      fileTypesTested: FILE_TYPE_PASS_ORDERS.filter((order) => passedOrders.has(order)).length,
      edgeCasesPassed: EDGE_CASE_ORDERS.filter((order) => passedOrders.has(order)).length
    };
  }

  function getTestTags(item) {
    const order = Number(item?.order);

    if (order >= 3 && order <= 5) return ['pdf'];
    if (order >= 6 && order <= 7) return ['docx'];
    if (order >= 8 && order <= 9) return ['pptx'];
    if (order >= 10 && order <= 11) return ['arabic', 'ocr'];
    if (order >= 12 && order <= 13) return ['arabic', 'pptx'];
    if (order >= 14 && order <= 15) return ['edgeCase'];
    if (order === 16) return ['pdfExport'];
    if (order >= 17 && order <= 18) return ['system'];

    return [];
  }

  function toggleExpanded(runId) {
    expandedRunId = expandedRunId === runId ? '' : runId;
  }

  async function fetchHistory({ expandRunId = '' } = {}) {
    historyError = '';
    historyLoading = history.length === 0;

    try {
      const response = await fetch(`${API_BASE}/api/admin/qa/history`, {
        credentials: 'include'
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || t('adminQA.errors.historyFailed'));

      history = Array.isArray(data?.runs) ? data.runs : [];
      expandedRunId = expandRunId || expandedRunId || history[0]?.id || '';
    } catch (err) {
      historyError = err?.message || t('adminQA.errors.historyFailed');
    } finally {
      historyLoading = false;
    }
  }

  async function fetchProgress() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/qa/progress`, {
        credentials: 'include'
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.inProgress) {
        progress = data || { inProgress: false };
        return;
      }

      progress = data;
      progressRunStartedAt = Date.now() - Number(data.elapsedMs || 0);
      progressReceivedAt = Date.now();
    } catch {
      progress = null;
    }
  }

  function startProgressPolling() {
    stopProgressPolling();
    void fetchProgress();
    progressInterval = setInterval(fetchProgress, 2000);
  }

  function stopProgressPolling() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  async function runQa() {
    if (running) return;

    running = true;
    result = null;
    error = '';
    rateLimitMessage = '';
    progress = null;
    progressRunStartedAt = 0;
    progressReceivedAt = 0;
    startProgressPolling();

    try {
      const response = await fetch(`${API_BASE}/api/admin/qa/run`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      const data = await response.json().catch(() => null);

      if (response.status === 429) {
        const retryAfterSeconds = Number(data?.retryAfterSeconds || 0);
        const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
        rateLimitMessage = t('adminQA.rateLimit', { minutes: formatNumber(minutes) });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || t('adminQA.errors.failed'));
      }

      result = data;
      await fetchHistory({ expandRunId: data?.id || '' });
    } catch (err) {
      error = err?.message || t('adminQA.errors.failed');
    } finally {
      running = false;
      stopProgressPolling();
      progress = null;
    }
  }

  onMount(() => {
    void fetchHistory();
    liveTimer = setInterval(() => {
      liveNow = Date.now();
    }, 1000);
  });

  onDestroy(() => {
    stopProgressPolling();
    if (liveTimer) clearInterval(liveTimer);
  });
</script>

<div class="admin-qa">
  <DataSurface title={t('adminQA.title')} description={t('adminQA.subtitle')} tableMinWidth="720px">
    <svelte:fragment slot="filters">
      <div class="qa-run-controls">
        <FieldShell className="filter-field" label={t('adminQA.targetLabel')} forId="admin-qa-target">
          <select id="admin-qa-target" bind:value={target} disabled={running}>
            <option value="staging">{t('adminQA.targets.staging')}</option>
            <option value="production">{t('adminQA.targets.production')}</option>
          </select>
        </FieldShell>

        {#if target === 'production'}
          <Badge tone="warning" size="sm">{t('adminQA.liveEnvironment')}</Badge>
        {/if}

        <Button
          type="button"
          variant="primary"
          size="sm"
          className="qa-run-controls__button"
          loading={running}
          disabled={running}
          on:click={runQa}
        >
          {running ? t('adminQA.running') : t('adminQA.run')}
        </Button>
      </div>
    </svelte:fragment>

    <svelte:fragment slot="state">
      {#if running}
        <div class="qa-loading" role="status">
          <span class="qa-spinner" aria-hidden="true"></span>
          <span>{t('adminQA.loading')}</span>
        </div>

        {#if progress?.inProgress}
          <div class="qa-progress" aria-label={t('adminQA.progress.label')}>
            <div class="qa-progress__header">
              <strong>{t('adminQA.progress.running', { test: progress.currentTest })}</strong>
              <span>{t('adminQA.progress.testCounter', { current: formatNumber(progress.currentTestIndex || 0), total: formatNumber(progress.totalTests || TOTAL_QA_TESTS) })}</span>
            </div>
            <div class="qa-progress__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress.percentComplete || 0}>
              <span style={`width: ${Math.max(0, Math.min(100, Number(progress.percentComplete || 0)))}%;`}></span>
            </div>
            <div class="qa-progress__meta">
              <span>{t('adminQA.progress.elapsed', { time: formatDurationShort(liveElapsedMs) })}</span>
              <span>{t('adminQA.progress.remaining', { time: formatDurationShort(liveRemainingMs) })}</span>
            </div>
          </div>
        {/if}
      {:else if rateLimitMessage}
        <Card class="ui-data-state-error qa-rate-limit" variant="soft" border="strong" padding="sm">
          {rateLimitMessage}
        </Card>
      {:else if error}
        <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">
          {error}
        </Card>
      {/if}
    </svelte:fragment>
  </DataSurface>

  {#if result}
    <section class="qa-results" aria-live="polite">
      <header class="qa-results__header">
        <div>
          <h2>{t('adminQA.resultsTitle')}</h2>
          <p>{t('adminQA.ranAt', { time: formatRunDate(result.ranAt) })}</p>
        </div>
      </header>

      <div class="qa-summary-grid">
        <div>
          <span>{t('adminQA.summary.passed')}</span>
          <strong>{formatNumber(result.passed || 0)}</strong>
        </div>
        <div>
          <span>{t('adminQA.summary.failed')}</span>
          <strong>{formatNumber(result.failed || 0)}</strong>
        </div>
        <div>
          <span>{t('adminQA.summary.totalTime')}</span>
          <strong>{formatDurationShort(result.totalDurationMs)}</strong>
        </div>
        <div>
          <span>{t('adminQA.summary.estimatedCost')}</span>
          <strong>{formatCost(result.estimatedCostUsd)}</strong>
        </div>
        <div>
          <span>{t('adminQA.summary.fileTypesTested')}</span>
          <strong>{formatNumber(getRunMetrics(result).fileTypesTested)}</strong>
        </div>
        <div>
          <span>{t('adminQA.summary.edgeCases')}</span>
          <strong>{t('adminQA.summary.edgeCasesValue', { passed: formatNumber(getRunMetrics(result).edgeCasesPassed), total: formatNumber(EDGE_CASE_ORDERS.length) })}</strong>
        </div>
      </div>

      {#if hasFailures}
        <div class="qa-banner qa-banner--danger" role="status">
          {t('adminQA.issuesDetected', { count: formatNumber(result.failed || 0) })}
        </div>
      {:else}
        <div class="qa-banner qa-banner--success" role="status">
          {t('adminQA.allSystemsGo')}
        </div>
      {/if}

      <div class="qa-test-grid">
        {#each result.results || [] as item}
          <Card className={`qa-test-card qa-test-card--${item.status}`} variant="base" border="strong" padding="sm">
            <div class="qa-test-card__header">
              <h3>{item.name || item.testName}</h3>
              <Badge tone={getStatusMeta(item.status).tone} size="sm">
                {getStatusLabel(item.status)}
              </Badge>
            </div>
            <p>{item.message}</p>
            <span class="qa-test-card__duration">
              {formatDuration(item.durationMs || 0)}
            </span>
          </Card>
        {/each}
      </div>
    </section>
  {/if}

  <DataSurface title={t('adminQA.history.title')} description={t('adminQA.history.description')} tableMinWidth="980px">
    <svelte:fragment slot="state">
      {#if historyLoading}
        <p class="ui-data-state-note">{t('adminQA.history.loading')}</p>
      {:else if historyError}
        <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">
          {historyError}
        </Card>
      {:else if history.length === 0}
        <p class="ui-data-state-note">{t('adminQA.history.empty')}</p>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="table">
      {#if !historyLoading && !historyError && history.length > 0}
        <table class="ui-data-table qa-history-table">
          <thead>
            <tr>
              <th>{t('adminQA.history.columns.dateTime')}</th>
              <th>{t('adminQA.history.columns.target')}</th>
              <th>{t('adminQA.history.columns.passed')}</th>
              <th>{t('adminQA.history.columns.failed')}</th>
              <th>{t('adminQA.history.columns.duration')}</th>
              <th>{t('adminQA.history.columns.cost')}</th>
              <th>{t('adminQA.history.columns.triggeredBy')}</th>
            </tr>
          </thead>
          <tbody>
            {#each history as run}
              <tr class="qa-history-row" class:expanded={expandedRunId === run.id} on:click={() => toggleExpanded(run.id)}>
                <td>
                  <button class="qa-history-toggle" type="button" aria-expanded={expandedRunId === run.id} aria-label={expandedRunId === run.id ? t('adminQA.history.collapse') : t('adminQA.history.expand')}>
                    <span class="qa-history-chevron" aria-hidden="true">{expandedRunId === run.id ? '▼' : '▶'}</span>
                    <span>{formatRunDate(run.ranAt)}</span>
                  </button>
                </td>
                <td>{t(`adminQA.targets.${run.target}`)}</td>
                <td><strong>{formatNumber(run.passed || 0)}</strong></td>
                <td><strong>{formatNumber(run.failed || 0)}</strong></td>
                <td>{formatDurationShort(run.totalDurationMs)}</td>
                <td>{formatCost(run.estimatedCostUsd)}</td>
                <td>{run.triggeredBy || '-'}</td>
              </tr>
              <tr class="qa-history-detail-row" class:expanded={expandedRunId === run.id} aria-hidden={expandedRunId !== run.id}>
                <td colspan="7">
                  <div class="qa-history-detail-shell">
                    <div class="qa-history-detail">
                      <h3>{t('adminQA.history.breakdown')}</h3>
                      <div class="qa-history-detail__list">
                        {#each getRunResults(run) as item}
                          <div class="qa-history-detail__item">
                            <div>
                              <div class="qa-history-detail__name">
                                <strong>{item.name || item.testName}</strong>
                                {#each getTestTags(item) as tag}
                                  <span class="qa-history-tag">{t(`adminQA.tags.${tag}`)}</span>
                                {/each}
                              </div>
                              <p>{item.message}</p>
                            </div>
                            <Badge tone={getStatusMeta(item.status).tone} size="sm">
                              {getStatusLabel(item.status)}
                            </Badge>
                            <span>{formatDuration(item.durationMs || 0)}</span>
                          </div>
                        {/each}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </svelte:fragment>
  </DataSurface>
</div>

<style>
  .admin-qa,
  .qa-results {
    display: grid;
    gap: var(--ui-space-4);
    min-width: 0;
  }

  .qa-loading {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-2);
    width: fit-content;
    max-width: 100%;
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
    border: 1px dashed var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 62%, transparent);
    padding: var(--ui-space-3) var(--ui-space-4);
  }

  .qa-spinner {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    border-radius: 999px;
    border: 2px solid color-mix(in srgb, var(--ui-text-secondary) 24%, transparent);
    border-top-color: var(--ui-text-primary);
    animation: qa-spin 700ms linear infinite;
  }

  .qa-run-controls {
    display: flex;
    align-items: flex-end;
    gap: var(--ui-space-3);
    width: 100%;
    min-width: 0;
  }

  .qa-run-controls :global(.filter-field) {
    flex: 0 1 22rem;
    min-width: 12rem;
  }

  :global(.qa-run-controls__button) {
    margin-inline-start: auto;
  }

  .qa-progress {
    display: grid;
    gap: var(--ui-space-2);
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 70%, transparent);
    padding: var(--ui-space-3);
  }

  .qa-progress__header,
  .qa-progress__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
  }

  .qa-progress__header strong {
    color: var(--ui-text-primary);
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
  }

  .qa-progress__header span,
  .qa-progress__meta {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  .qa-progress__bar {
    height: 0.55rem;
    overflow: hidden;
    border-radius: 999px;
    background: color-mix(in srgb, var(--ui-text-primary) 10%, transparent);
  }

  .qa-progress__bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--ui-text-primary);
    transition: width 220ms var(--ease-standard);
  }

  :global(.qa-rate-limit) {
    color: color-mix(in srgb, var(--ui-accent-warning) 82%, var(--ui-text-primary) 18%);
    border-color: color-mix(in srgb, var(--ui-accent-warning) 34%, var(--ui-border-default) 66%);
  }

  .qa-results__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-3);
    min-width: 0;
  }

  .qa-results__header h2,
  .qa-history-detail h3 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-title-sm);
    font-weight: 600;
    letter-spacing: 0;
  }

  .qa-results__header p {
    margin: 0.35rem 0 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .qa-summary-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: var(--ui-space-3);
  }

  .qa-summary-grid > div {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 74%, var(--ui-surface-card) 26%);
    padding: var(--ui-space-3);
  }

  .qa-summary-grid span,
  .qa-test-card__duration {
    color: var(--ui-text-muted);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .qa-summary-grid strong {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--ui-text-primary);
    font-size: 1.15rem;
    font-weight: 650;
    letter-spacing: 0;
  }

  .qa-banner {
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--ui-border-default);
    padding: var(--ui-space-3) var(--ui-space-4);
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
  }

  .qa-banner--success {
    color: color-mix(in srgb, var(--ui-accent-success) 84%, var(--ui-text-primary) 16%);
    border-color: color-mix(in srgb, var(--ui-accent-success) 30%, var(--ui-border-default) 70%);
    background: color-mix(in srgb, var(--ui-accent-success) 10%, transparent);
  }

  .qa-banner--danger {
    color: color-mix(in srgb, var(--ui-accent-danger) 84%, var(--ui-text-primary) 16%);
    border-color: color-mix(in srgb, var(--ui-accent-danger) 30%, var(--ui-border-default) 70%);
    background: color-mix(in srgb, var(--ui-accent-danger) 10%, transparent);
  }

  .qa-test-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ui-space-3);
  }

  :global(.qa-test-card) {
    gap: var(--ui-space-3);
  }

  .qa-test-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-3);
  }

  .qa-test-card__header h3 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-body-md);
    font-weight: 600;
    letter-spacing: 0;
    line-height: 1.35;
  }

  :global(.qa-test-card) p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  :global(.qa-test-card--fail) {
    border-color: color-mix(in srgb, var(--ui-accent-danger) 30%, var(--ui-border-default) 70%);
  }

  :global(.qa-test-card--pass) {
    border-color: color-mix(in srgb, var(--ui-accent-success) 24%, var(--ui-border-default) 76%);
  }

  .qa-history-row {
    cursor: pointer;
  }

  .qa-history-row.expanded {
    background: color-mix(in srgb, var(--ui-surface-secondary) 52%, transparent);
  }

  .qa-history-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-2);
    max-width: 100%;
    appearance: none;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--ui-text-primary);
    font: inherit;
    font-weight: 600;
    text-align: start;
    cursor: pointer;
  }

  .qa-history-chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.9rem;
    flex: 0 0 auto;
    color: var(--ui-text-muted);
    font-size: 0.72rem;
    line-height: 1;
  }

  .qa-history-detail-row td {
    background: color-mix(in srgb, var(--ui-surface-secondary) 38%, transparent);
  }

  .qa-history-detail-row:not(.expanded) td {
    padding-top: 0;
    padding-bottom: 0;
    border-bottom: 0;
  }

  .qa-history-detail-shell {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition:
      max-height 260ms var(--ease-standard),
      opacity 180ms var(--ease-standard);
  }

  .qa-history-detail-row.expanded .qa-history-detail-shell {
    max-height: 42rem;
    opacity: 1;
  }

  .qa-history-detail {
    display: grid;
    gap: var(--ui-space-3);
    min-width: 0;
  }

  .qa-history-detail__list {
    display: grid;
    gap: var(--ui-space-2);
  }

  .qa-history-detail__name {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    flex-wrap: wrap;
    min-width: 0;
  }

  .qa-history-tag {
    display: inline-flex;
    align-items: center;
    min-height: 1.25rem;
    border: 1px solid color-mix(in srgb, var(--ui-text-muted) 18%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--ui-surface-secondary) 78%, transparent);
    color: var(--ui-text-muted);
    font-size: 0.68rem;
    font-weight: 600;
    line-height: 1;
    padding: 0.18rem 0.46rem;
    white-space: nowrap;
  }

  .qa-history-detail__item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: start;
    gap: var(--ui-space-3);
    border-top: 1px solid var(--ui-border-default);
    padding-top: var(--ui-space-2);
  }

  .qa-history-detail__item p {
    margin: 0.25rem 0 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .qa-history-detail__item > span {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-body-sm);
    white-space: nowrap;
  }

  @keyframes qa-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 860px) {
    .qa-test-grid {
      grid-template-columns: 1fr;
    }

    .qa-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .qa-run-controls {
      align-items: stretch;
      flex-direction: column;
    }

    :global(.qa-run-controls__button) {
      width: 100%;
      margin-inline-start: 0;
    }

    .qa-history-detail__item {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .qa-summary-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
