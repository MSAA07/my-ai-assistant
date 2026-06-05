<script>
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { API_BASE } from '../../config.js';
  import { formatDate, formatNumber, t } from '../../lib/i18n/t.js';
  import { language } from '../../lib/stores/language.js';

  const statusMeta = {
    pass: { tone: 'success', symbol: '✅', labelKey: 'adminQA.status.pass' },
    fail: { tone: 'danger', symbol: '❌', labelKey: 'adminQA.status.fail' },
    skip: { tone: 'neutral', symbol: '⏭', labelKey: 'adminQA.status.skip' }
  };

  let target = 'staging';
  let running = false;
  let result = null;
  let error = '';
  let rateLimitMessage = '';

  $: $language;
  $: hasFailures = Number(result?.failed || 0) > 0;

  function formatDuration(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value)) return '-';
    if (value < 1000) return t('adminQA.durationMs', { duration: formatNumber(Math.round(value)) });
    const seconds = value / 1000;
    if (seconds < 60) return `${formatNumber(seconds, { maximumFractionDigits: seconds >= 10 ? 0 : 1 })}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${formatNumber(minutes)}m ${formatNumber(remainingSeconds)}s`;
  }

  function formatCost(value) {
    const amount = Number(value);
    return formatNumber(Number.isFinite(amount) ? amount : 0, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    });
  }

  function formatRunDate(value) {
    return value
      ? formatDate(value, { dateStyle: 'medium', timeStyle: 'short' })
      : '-';
  }

  function getStatusMeta(status) {
    return statusMeta[status] || statusMeta.skip;
  }

  function getStatusLabel(status) {
    const meta = getStatusMeta(status);
    return `${meta.symbol} ${t(meta.labelKey)}`;
  }

  async function runQa() {
    if (running) return;

    running = true;
    error = '';
    rateLimitMessage = '';

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
    } catch (err) {
      error = err?.message || t('adminQA.errors.failed');
    } finally {
      running = false;
    }
  }
</script>

<div class="admin-qa">
  <DataSurface title={t('adminQA.title')} description={t('adminQA.subtitle')} tableMinWidth="720px">
    <Button
      slot="actions"
      type="button"
      variant="primary"
      size="sm"
      loading={running}
      disabled={running}
      on:click={runQa}
    >
      {running ? t('adminQA.running') : t('adminQA.run')}
    </Button>

    <svelte:fragment slot="filters">
      <FieldShell className="filter-field" label={t('adminQA.targetLabel')} forId="admin-qa-target">
        <select id="admin-qa-target" bind:value={target} disabled={running}>
          <option value="staging">{t('adminQA.targets.staging')}</option>
          <option value="production">{t('adminQA.targets.production')}</option>
        </select>
      </FieldShell>

      {#if target === 'production'}
        <Badge tone="warning" size="sm">{t('adminQA.liveEnvironment')}</Badge>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="state">
      {#if running}
        <div class="qa-loading" role="status">
          <span class="qa-spinner" aria-hidden="true"></span>
          <span>{t('adminQA.loading')}</span>
        </div>
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
          <strong>{formatDuration(result.totalDurationMs)}</strong>
        </div>
        <div>
          <span>{t('adminQA.summary.estimatedCost')}</span>
          <strong>{formatCost(result.estimatedCostUsd)}</strong>
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
              <h3>{item.name}</h3>
              <Badge tone={getStatusMeta(item.status).tone} size="sm">
                {getStatusLabel(item.status)}
              </Badge>
            </div>
            <p>{item.message}</p>
            <span class="qa-test-card__duration">
              {t('adminQA.durationMs', { duration: formatNumber(item.durationMs || 0) })}
            </span>
          </Card>
        {/each}
      </div>
    </section>
  {/if}
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

  .qa-results__header h2 {
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
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

  @keyframes qa-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 860px) {
    .qa-summary-grid,
    .qa-test-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
