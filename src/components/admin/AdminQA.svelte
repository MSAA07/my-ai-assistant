<script>
  import { onDestroy, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import ModalSurface from '../../lib/components/ui/ModalSurface.svelte';
  import Toggle from '../../lib/components/ui/Toggle.svelte';
  import { getQaStagingApiBaseUrl } from '../../config.js';
  import { formatDate, formatNumber, t } from '../../lib/i18n/t.js';
  import { language } from '../../lib/stores/language.js';

  const statusMeta = {
    pass: { tone: 'success', labelKey: 'adminQA.status.pass' },
    fail: { tone: 'danger', labelKey: 'adminQA.status.fail' },
    skip: { tone: 'neutral', labelKey: 'adminQA.status.skip' }
  };

  const tierMeta = {
    health: { labelKey: 'adminQA.tiers.health', tone: 'info' },
    pipeline: { labelKey: 'adminQA.tiers.pipeline', tone: 'accent' },
    optimized: { labelKey: 'adminQA.tiers.optimized', tone: 'warning' },
    full: { labelKey: 'adminQA.tiers.full', tone: 'danger' }
  };

  const frequencyOptions = [
    { value: 30, labelKey: 'adminQA.monitor.frequencies.30' },
    { value: 60, labelKey: 'adminQA.monitor.frequencies.60' },
    { value: 180, labelKey: 'adminQA.monitor.frequencies.180' },
    { value: 360, labelKey: 'adminQA.monitor.frequencies.360' },
    { value: 720, labelKey: 'adminQA.monitor.frequencies.720' },
    { value: 1440, labelKey: 'adminQA.monitor.frequencies.1440' }
  ];

  const target = 'staging';
  let running = false;
  let activeRunLabel = '';
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
  let schedule = { enabled: false, frequencyMins: 60, tier: 'health' };
  let scheduleLoading = true;
  let scheduleSaving = false;
  let scheduleError = '';
  let confirmFullMode = '';
  let reportRun = null;
  let copyState = '';

  $: $language;
  $: lastAutoRun = history.find((run) => run?.triggeredBy === 'auto');
  $: liveElapsedMs = progress?.inProgress && progressRunStartedAt
    ? Math.max(0, liveNow - progressRunStartedAt)
    : 0;
  $: liveRemainingMs = progress?.inProgress
    ? Math.max(0, Number(progress.estimatedRemainingMs || 0) - Math.max(0, liveNow - progressReceivedAt))
    : 0;
  $: currentTierLabel = progress?.tierLabel || activeRunLabel || t('adminQA.progress.unknownTier');

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

  function getTierMeta(tier) {
    return tierMeta[tier] || tierMeta.full;
  }

  function getTierLabel(tier) {
    return t(getTierMeta(tier).labelKey);
  }

  function getRunResults(run) {
    return Array.isArray(run?.results) ? run.results : [];
  }

  function getTestTags(item) {
    const name = String(item?.name || item?.testName || '').toLowerCase();

    if (name.includes('backend') || name.includes('database') || name.includes('api key') || name.includes('storage')) return ['system'];
    if (name.includes('pdf export')) return ['pdfExport'];
    if (name.includes('admin endpoints') || name.includes('sign out')) return ['system'];
    if (name.includes('oversized') || name.includes('corrupt')) return ['edgeCase'];
    if (name.includes('arabic pdf')) return ['arabic', 'ocr'];
    if (name.includes('arabic pptx')) return ['arabic', 'pptx'];
    if (name.includes('docx')) return ['docx'];
    if (name.includes('pptx')) return ['pptx'];
    if (name.includes('pdf')) return ['pdf'];

    return [];
  }

  function toggleExpanded(runId) {
    expandedRunId = expandedRunId === runId ? '' : runId;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getQaEndpoint(path) {
    return `${getQaStagingApiBaseUrl()}/api/admin/qa${path}`;
  }

  async function fetchSchedule() {
    scheduleError = '';
    scheduleLoading = true;

    try {
      const response = await fetch(getQaEndpoint('/schedule'), {
        credentials: 'include'
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || t('adminQA.errors.scheduleFailed'));
      schedule = {
        enabled: Boolean(data?.enabled),
        frequencyMins: Number(data?.frequencyMins || 60),
        tier: data?.tier || 'health'
      };
    } catch (err) {
      scheduleError = err?.message || t('adminQA.errors.scheduleFailed');
    } finally {
      scheduleLoading = false;
    }
  }

  async function saveSchedule(nextSchedule) {
    scheduleSaving = true;
    scheduleError = '';

    try {
      const response = await fetch(getQaEndpoint('/schedule'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSchedule)
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || t('adminQA.errors.scheduleSaveFailed'));
      schedule = {
        enabled: Boolean(data?.enabled),
        frequencyMins: Number(data?.frequencyMins || 60),
        tier: data?.tier || 'health'
      };
    } catch (err) {
      scheduleError = err?.message || t('adminQA.errors.scheduleSaveFailed');
      await fetchSchedule();
    } finally {
      scheduleSaving = false;
    }
  }

  function handleScheduleToggle(event) {
    void saveSchedule({
      enabled: Boolean(event.detail?.checked),
      frequencyMins: schedule.frequencyMins
    });
  }

  function handleFrequencyChange(event) {
    const frequencyMins = Number(event.currentTarget.value);
    void saveSchedule({
      enabled: schedule.enabled,
      frequencyMins
    });
  }

  async function fetchHistory({ expandRunId = '' } = {}) {
    historyError = '';
    historyLoading = history.length === 0;

    try {
      const response = await fetch(getQaEndpoint('/history'), {
        credentials: 'include'
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || t('adminQA.errors.historyFailed'));

      history = Array.isArray(data?.runs) ? data.runs : [];
      expandedRunId = expandRunId || expandedRunId || history[0]?.id || '';
      return history;
    } catch (err) {
      historyError = err?.message || t('adminQA.errors.historyFailed');
      return [];
    } finally {
      historyLoading = false;
    }
  }

  async function fetchProgress() {
    try {
      const response = await fetch(getQaEndpoint('/progress'), {
        credentials: 'include'
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.inProgress) {
        progress = data || { inProgress: false };
        return progress;
      }

      progress = data;
      activeRunLabel = data.tierLabel || '';
      progressRunStartedAt = Date.now() - Number(data.elapsedMs || 0);
      progressReceivedAt = Date.now();
      return progress;
    } catch {
      progress = null;
      return null;
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

  async function waitForQaCompletion() {
    let sawInProgress = false;
    const startedAt = Date.now();

    while (Date.now() - startedAt < 25 * 60 * 1000) {
      await sleep(2000);
      const currentProgress = await fetchProgress();

      if (currentProgress?.inProgress) {
        sawInProgress = true;
        continue;
      }

      if (!sawInProgress && Date.now() - startedAt < 10_000) {
        continue;
      }

      const runs = await fetchHistory();
      return runs[0] || null;
    }

    throw new Error(t('adminQA.errors.failed'));
  }

  async function resumeActiveQaRun() {
    if (running) return;

    const currentProgress = await fetchProgress();
    if (!currentProgress?.inProgress) return;

    running = true;
    error = '';
    rateLimitMessage = '';
    startProgressPolling();

    try {
      const latest = await waitForQaCompletion();
      if (latest?.id) {
        await fetchHistory({ expandRunId: latest.id });
      }
    } catch (err) {
      error = err?.message || t('adminQA.errors.failed');
    } finally {
      running = false;
      stopProgressPolling();
      progress = null;
      activeRunLabel = '';
    }
  }

  function getRunEndpoint(tier, mode) {
    if (tier === 'health') return { path: '/health', body: { target } };
    if (tier === 'pipeline') return { path: '/pipeline', body: { target } };
    return { path: '/full', body: { target, mode } };
  }

  async function runQa(tier, mode = '') {
    if (running) return;

    const endpoint = getRunEndpoint(tier, mode);
    const runTier = tier === 'full' ? mode : tier;
    running = true;
    activeRunLabel = getTierLabel(runTier);
    error = '';
    rateLimitMessage = '';
    progress = null;
    progressRunStartedAt = 0;
    progressReceivedAt = 0;
    startProgressPolling();

    try {
      const response = await fetch(getQaEndpoint(endpoint.path), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endpoint.body)
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

      const latest = await waitForQaCompletion();
      if (latest?.id) {
        await fetchHistory({ expandRunId: latest.id });
      }
    } catch (err) {
      error = err?.message || t('adminQA.errors.failed');
    } finally {
      running = false;
      stopProgressPolling();
      progress = null;
      activeRunLabel = '';
    }
  }

  function requestFullRun(mode) {
    confirmFullMode = mode;
  }

  function cancelFullRun() {
    confirmFullMode = '';
  }

  function confirmFullRun() {
    const mode = confirmFullMode;
    confirmFullMode = '';
    void runQa('full', mode);
  }

  function openReport(run, event) {
    event?.stopPropagation();
    reportRun = run;
    copyState = '';
  }

  function closeReport() {
    reportRun = null;
    copyState = '';
  }

  async function copyReport() {
    const text = reportRun?.failureReport || '';
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      copyState = t('adminQA.report.copied');
    } catch {
      copyState = t('adminQA.report.copyFailed');
    }
  }

  onMount(() => {
    void fetchSchedule();
    void fetchHistory();
    void resumeActiveQaRun();
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
  <Card className="qa-monitor" variant="base" border="strong" padding="md">
    <div class="qa-section-header">
      <div>
        <h2>{t('adminQA.monitor.title')}</h2>
        <p>
          {schedule.enabled
            ? t('adminQA.monitor.enabledStatus', { frequency: t(`adminQA.monitor.frequencyLabels.${schedule.frequencyMins}`) })
            : t('adminQA.monitor.disabledStatus')}
        </p>
      </div>

      <Toggle
        checked={schedule.enabled}
        disabled={scheduleLoading || scheduleSaving}
        label={schedule.enabled ? t('adminQA.monitor.on') : t('adminQA.monitor.off')}
        on:change={handleScheduleToggle}
      />
    </div>

    {#if schedule.enabled}
      <FieldShell className="qa-monitor__frequency" label={t('adminQA.monitor.frequencyLabel')} forId="qa-monitor-frequency">
        <select id="qa-monitor-frequency" value={schedule.frequencyMins} disabled={scheduleSaving} on:change={handleFrequencyChange}>
          {#each frequencyOptions as option}
            <option value={option.value}>{t(option.labelKey)}</option>
          {/each}
        </select>
      </FieldShell>
    {/if}

    <div class="qa-monitor__meta">
      <span>{lastAutoRun ? t('adminQA.monitor.lastAutoRun', { time: formatRunDate(lastAutoRun.ranAt) }) : t('adminQA.monitor.noAutoRun')}</span>
      {#if scheduleSaving}
        <span>{t('adminQA.monitor.saving')}</span>
      {/if}
    </div>

    {#if scheduleError}
      <p class="qa-error-text">{scheduleError}</p>
    {/if}
  </Card>

  <Card className="qa-run-panel" variant="base" border="strong" padding="md">
    <div class="qa-section-header qa-run-panel__header">
      <div>
        <h2>{t('adminQA.runSection.title')}</h2>
        <p>{t('adminQA.runSection.subtitle')}</p>
      </div>

      <div class="qa-target-control">
        <span class="qa-target-control__label">{t('adminQA.targetLabel')}</span>
        <Badge tone="success" size="sm">{t('adminQA.targets.staging')}</Badge>
      </div>
    </div>

    <div class="qa-card-grid">
      <Card className="qa-tier-card" variant="soft" border="default" padding="sm">
        <div class="qa-tier-card__heading">
          <h3>{t('adminQA.cards.health.label')}</h3>
          <div class="qa-tier-card__badges">
            <Badge tone="success" size="sm">{t('adminQA.cards.health.cost')}</Badge>
            <Badge tone="info" size="sm">{t('adminQA.cards.health.speed')}</Badge>
          </div>
        </div>
        <p>{t('adminQA.cards.health.subtitle')}</p>
        <Button type="button" variant="primary" size="sm" loading={running && activeRunLabel === getTierLabel('health')} disabled={running} on:click={() => runQa('health')}>
          {t('adminQA.cards.health.run')}
        </Button>
      </Card>

      <Card className="qa-tier-card" variant="soft" border="default" padding="sm">
        <div class="qa-tier-card__heading">
          <h3>{t('adminQA.cards.pipeline.label')}</h3>
          <div class="qa-tier-card__badges">
            <Badge tone="success" size="sm">{t('adminQA.cards.pipeline.cost')}</Badge>
            <Badge tone="info" size="sm">{t('adminQA.cards.pipeline.speed')}</Badge>
          </div>
        </div>
        <p>{t('adminQA.cards.pipeline.subtitle')}</p>
        <Button type="button" variant="primary" size="sm" loading={running && activeRunLabel === getTierLabel('pipeline')} disabled={running} on:click={() => runQa('pipeline')}>
          {t('adminQA.cards.pipeline.run')}
        </Button>
      </Card>

      <Card className="qa-tier-card" variant="soft" border="default" padding="sm">
        <div class="qa-tier-card__heading">
          <h3>{t('adminQA.cards.full.label')}</h3>
        </div>
        <p>{t('adminQA.cards.full.subtitle')}</p>
        <div class="qa-tier-card__actions">
          <Button type="button" variant="warning" size="sm" disabled={running} on:click={() => requestFullRun('optimized')}>
            {t('adminQA.cards.full.runOptimized')}
          </Button>
          <Button type="button" variant="danger" size="sm" disabled={running} on:click={() => requestFullRun('full')}>
            {t('adminQA.cards.full.runFull')}
          </Button>
        </div>
      </Card>
    </div>

    {#if running && progress?.inProgress}
      <div class="qa-progress" aria-label={t('adminQA.progress.label')}>
        <div class="qa-progress__header">
          <strong>{t('adminQA.progress.runningTier', { tier: currentTierLabel })}</strong>
          <span>{t('adminQA.progress.testCounter', { current: formatNumber(progress.currentTestIndex || 0), total: formatNumber(progress.totalTests || 0) })}</span>
        </div>
        <p>{progress.currentTest}</p>
        <div class="qa-progress__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress.percentComplete || 0}>
          <span style={`width: ${Math.max(0, Math.min(100, Number(progress.percentComplete || 0)))}%;`}></span>
        </div>
        <div class="qa-progress__meta">
          <span>{t('adminQA.progress.elapsed', { time: formatDurationShort(liveElapsedMs) })}</span>
          <span>{t('adminQA.progress.remaining', { time: formatDurationShort(liveRemainingMs) })}</span>
        </div>
      </div>
    {:else if running}
      <div class="qa-loading" role="status">
        <span class="qa-spinner" aria-hidden="true"></span>
        <span>{t('adminQA.loading')}</span>
      </div>
    {:else if rateLimitMessage}
      <Card className="qa-rate-limit" variant="soft" border="strong" padding="sm">
        {rateLimitMessage}
      </Card>
    {:else if error}
      <Card className="qa-error" variant="soft" border="strong" padding="sm">
        {error}
      </Card>
    {/if}
  </Card>

  <DataSurface title={t('adminQA.history.title')} description={t('adminQA.history.description')} tableMinWidth="1080px">
    <svelte:fragment slot="state">
      {#if historyLoading}
        <p class="ui-data-state-note">{t('adminQA.history.loading')}</p>
      {:else if historyError}
        <Card className="qa-error" variant="soft" border="strong" padding="sm">
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
              <th>{t('adminQA.history.columns.tier')}</th>
              <th>{t('adminQA.history.columns.passed')}</th>
              <th>{t('adminQA.history.columns.failed')}</th>
              <th>{t('adminQA.history.columns.duration')}</th>
              <th>{t('adminQA.history.columns.cost')}</th>
              <th>{t('adminQA.history.columns.triggeredBy')}</th>
              <th>{t('adminQA.history.columns.report')}</th>
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
                <td>
                  <Badge tone={getTierMeta(run.tier).tone} size="sm" className={`qa-tier-badge qa-tier-badge--${run.tier || 'full'}`}>
                    {getTierLabel(run.tier || 'full')}
                  </Badge>
                </td>
                <td><strong>{formatNumber(run.passed || 0)}</strong></td>
                <td><strong>{formatNumber(run.failed || 0)}</strong></td>
                <td>{formatDurationShort(run.totalDurationMs)}</td>
                <td>{formatCost(run.estimatedCostUsd)}</td>
                <td>{run.triggeredBy || '-'}</td>
                <td>
                  {#if run.failureReport}
                    <Button type="button" variant="secondary" size="sm" on:click={(event) => openReport(run, event)}>
                      {t('adminQA.report.view')}
                    </Button>
                  {:else}
                    <span class="qa-muted">-</span>
                  {/if}
                </td>
              </tr>
              <tr class="qa-history-detail-row" class:expanded={expandedRunId === run.id} aria-hidden={expandedRunId !== run.id}>
                <td colspan="9">
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
                            <span class={`qa-speed qa-speed--${item.speedVerdict || 'fast'}`}>{t(`adminQA.speed.${item.speedVerdict || 'fast'}`)}</span>
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

  <Card className="qa-speed-legend" variant="soft" border="default" padding="sm">
    <span><i class="qa-dot qa-dot--fast"></i>{t('adminQA.legend.fast')}</span>
    <span><i class="qa-dot qa-dot--slow"></i>{t('adminQA.legend.slow')}</span>
    <span><i class="qa-dot qa-dot--very-slow"></i>{t('adminQA.legend.verySlow')}</span>
  </Card>
</div>

<ModalSurface
  open={Boolean(confirmFullMode)}
  width="min(420px, 100%)"
  labelledBy="qa-confirm-title"
  on:close={cancelFullRun}
>
  <div class="qa-modal-content">
    <h2 id="qa-confirm-title">{t('adminQA.confirm.title')}</h2>
    <p>{t('adminQA.confirm.message', { cost: confirmFullMode === 'full' ? '~$1.50' : '~$0.30' })}</p>
    <div class="qa-modal-actions">
      <Button type="button" variant="ghost" on:click={cancelFullRun}>{t('adminQA.confirm.cancel')}</Button>
      <Button type="button" variant="danger" on:click={confirmFullRun}>{t('adminQA.confirm.confirm')}</Button>
    </div>
  </div>
</ModalSurface>

<ModalSurface
  open={Boolean(reportRun)}
  width="min(760px, 100%)"
  labelledBy="qa-report-title"
  on:close={closeReport}
>
  <div class="qa-modal-content qa-report-modal">
    <div class="qa-section-header">
      <div>
        <h2 id="qa-report-title">{t('adminQA.report.title')}</h2>
        <p>{reportRun ? formatRunDate(reportRun.ranAt) : ''}</p>
      </div>
      <Button type="button" variant="ghost" size="sm" on:click={closeReport}>{t('common.close')}</Button>
    </div>

    <pre>{reportRun?.failureReport || ''}</pre>

    <div class="qa-modal-actions">
      {#if copyState}
        <span class="qa-copy-state">{copyState}</span>
      {/if}
      <Button type="button" variant="primary" on:click={copyReport}>{t('adminQA.report.copy')}</Button>
    </div>
  </div>
</ModalSurface>

<style>
  .admin-qa {
    display: grid;
    gap: var(--ui-space-4);
    min-width: 0;
  }

  :global(.qa-monitor),
  :global(.qa-run-panel) {
    gap: var(--ui-space-4);
  }

  .qa-section-header,
  .qa-run-panel__header,
  .qa-progress__header,
  .qa-progress__meta {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-3);
    min-width: 0;
  }

  .qa-section-header h2,
  .qa-tier-card__heading h3,
  .qa-history-detail h3,
  .qa-modal-content h2 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-title-sm);
    font-weight: 600;
    letter-spacing: 0;
  }

  .qa-section-header p,
  :global(.qa-tier-card) p,
  .qa-progress p,
  .qa-modal-content p,
  .qa-monitor__meta {
    margin: 0.35rem 0 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .qa-monitor__frequency {
    max-width: 18rem;
  }

  .qa-monitor__meta {
    display: flex;
    align-items: center;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
    margin-top: 0;
  }

  .qa-target-control {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    flex-wrap: wrap;
  }

  .qa-target-control__label {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
  }

  .qa-card-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ui-space-3);
  }

  :global(.qa-tier-card) {
    min-height: 13rem;
    justify-content: space-between;
  }

  .qa-tier-card__heading {
    display: grid;
    gap: var(--ui-space-2);
  }

  .qa-tier-card__badges,
  .qa-tier-card__actions {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    flex-wrap: wrap;
  }

  .qa-progress {
    display: grid;
    gap: var(--ui-space-2);
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 70%, transparent);
    padding: var(--ui-space-3);
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

  :global(.qa-error),
  :global(.qa-rate-limit) {
    color: color-mix(in srgb, var(--ui-accent-danger) 84%, var(--ui-text-primary) 16%);
    border-color: color-mix(in srgb, var(--ui-accent-danger) 30%, var(--ui-border-default) 70%);
  }

  .qa-error-text {
    margin: 0;
    color: color-mix(in srgb, var(--ui-accent-danger) 84%, var(--ui-text-primary) 16%);
    font-size: var(--ui-type-body-sm);
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
    grid-template-columns: minmax(0, 1fr) auto auto auto;
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

  :global(.qa-tier-badge--pipeline) {
    color: color-mix(in srgb, #8b5cf6 84%, var(--ui-text-primary) 16%);
    border-color: color-mix(in srgb, #8b5cf6 34%, var(--ui-border-default) 66%);
    background: color-mix(in srgb, #8b5cf6 14%, transparent);
  }

  .qa-muted {
    color: var(--ui-text-muted);
  }

  .qa-speed {
    font-weight: 600;
  }

  .qa-speed--fast {
    color: color-mix(in srgb, var(--ui-accent-success) 84%, var(--ui-text-primary) 16%) !important;
  }

  .qa-speed--slow {
    color: color-mix(in srgb, var(--ui-accent-warning) 84%, var(--ui-text-primary) 16%) !important;
  }

  .qa-speed--very_slow {
    color: color-mix(in srgb, var(--ui-accent-danger) 84%, var(--ui-text-primary) 16%) !important;
  }

  :global(.qa-speed-legend) {
    flex-direction: row;
    align-items: center;
    gap: var(--ui-space-4);
    flex-wrap: wrap;
  }

  :global(.qa-speed-legend) span {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-2);
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  .qa-dot {
    width: 0.62rem;
    height: 0.62rem;
    border-radius: 999px;
    display: inline-block;
  }

  .qa-dot--fast {
    background: var(--ui-accent-success);
  }

  .qa-dot--slow {
    background: var(--ui-accent-warning);
  }

  .qa-dot--very-slow {
    background: var(--ui-accent-danger);
  }

  .qa-modal-content {
    display: grid;
    gap: var(--ui-space-3);
  }

  .qa-modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ui-space-2);
    flex-wrap: wrap;
  }

  .qa-report-modal pre {
    max-height: min(56vh, 32rem);
    overflow: auto;
    margin: 0;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 70%, transparent);
    color: var(--ui-text-primary);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.78rem;
    line-height: 1.55;
    white-space: pre-wrap;
    padding: var(--ui-space-3);
  }

  .qa-copy-state {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  @keyframes qa-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 980px) {
    .qa-card-grid {
      grid-template-columns: 1fr;
    }

    .qa-section-header,
    .qa-run-panel__header {
      align-items: stretch;
      flex-direction: column;
    }
  }

  @media (max-width: 720px) {
    .qa-history-detail__item {
      grid-template-columns: 1fr;
    }

    .qa-modal-actions {
      justify-content: stretch;
    }
  }
</style>
