<script>
  import { onMount } from 'svelte';
  import { Activity, AlertCircle, DollarSign, RefreshCw, TrendingUp, Zap } from '@lucide/svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import UsageBreakdownTable from './UsageBreakdownTable.svelte';
  import UsageLineChart from './UsageLineChart.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';

  const CACHE_KEY = 'page:admin:usage';
  const SAR_RATE = 3.75;
  const rangeOptions = [
    { value: '7d', label: '7 Days', subtitle: 'Last 7 days' },
    { value: '30d', label: '30 Days', subtitle: 'Last 30 days' },
    { value: 'year', label: 'This Year', subtitle: 'This year' },
    { value: 'all', label: 'All Time', subtitle: 'All time' }
  ];
  const groupByOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ];

  let summary = null;
  let users = [];
  let documents = [];
  let models = [];
  let features = [];
  let series = [];
  let loading = true;
  let refreshing = false;
  let error = '';
  let range = '30d';
  let groupBy = 'day';

  $: activeRange = rangeOptions.find((item) => item.value === range) || rangeOptions[1];
  $: activeGroupBy = groupByOptions.find((item) => item.value === groupBy) || groupByOptions[0];
  $: totals = summary?.totals || {};
  $: sarRate = Number(summary?.sarRate || SAR_RATE);
  $: totalUsd = Number(totals.costUsd || 0);
  $: totalSar = Number(totals.costSar ?? totalUsd * sarRate);

  function formatUsd(value) {
    const amount = Number(value || 0);
    const digits = amount >= 1 ? 2 : 4;
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })}`;
  }

  function formatSar(value) {
    return `${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} SAR`;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function formatRate(value) {
    return Number(value || SAR_RATE).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function normalizeRange(value) {
    return rangeOptions.some((item) => item.value === value) ? value : '30d';
  }

  function normalizeGroupBy(value) {
    return groupByOptions.some((item) => item.value === value) ? value : 'day';
  }

  function setRangeDates(params) {
    const selectedRange = normalizeRange(range);
    const now = new Date();
    const from = new Date(now);

    if (selectedRange === 'all') return;
    if (selectedRange === '7d') from.setDate(from.getDate() - 7);
    if (selectedRange === '30d') from.setDate(from.getDate() - 30);
    if (selectedRange === 'year') {
      from.setMonth(0, 1);
      from.setHours(0, 0, 0, 0);
    }

    params.set('from', from.toISOString());
    params.set('to', now.toISOString());
  }

  function buildQuery(extra = {}) {
    const params = new URLSearchParams();
    setRangeDates(params);
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== null && value !== '') params.set(key, value);
    }
    return params.toString();
  }

  function withQuery(path, query) {
    return query ? `${path}?${query}` : path;
  }

  async function fetchJson(path) {
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch usage data');
    return data;
  }

  async function fetchUsage({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

    try {
      const baseQuery = buildQuery();
      const seriesQuery = buildQuery({ granularity: normalizeGroupBy(groupBy) });
      const [summaryData, usersData, documentsData, modelsData, featuresData, timeData] = await Promise.all([
        fetchJson(withQuery('/api/admin/usage/summary', baseQuery)),
        fetchJson(withQuery('/api/admin/usage/users', baseQuery)),
        fetchJson(withQuery('/api/admin/usage/documents', baseQuery)),
        fetchJson(withQuery('/api/admin/usage/models', baseQuery)),
        fetchJson(withQuery('/api/admin/usage/features', baseQuery)),
        fetchJson(withQuery('/api/admin/usage/timeseries', seriesQuery))
      ]);

      summary = summaryData;
      users = usersData.users || [];
      documents = documentsData.documents || [];
      models = modelsData.models || [];
      features = featuresData.features || [];
      series = timeData.series || [];
      writePageCache(CACHE_KEY, {
        loaded: true,
        summary,
        users,
        documents,
        models,
        features,
        series,
        range,
        groupBy
      });
      error = '';
    } catch (err) {
      error = err.message;
    } finally {
      if (background) {
        refreshing = false;
      } else {
        loading = false;
      }
    }
  }

  function selectRange(value) {
    if (range === value) return;
    range = value;
    void fetchUsage({ background: Boolean(summary) });
  }

  function selectGroupBy(value) {
    if (groupBy === value) return;
    groupBy = value;
    void fetchUsage({ background: Boolean(summary) });
  }

  onMount(() => {
    const cached = readPageCache(CACHE_KEY);
    if (cached?.loaded) {
      summary = cached.summary || null;
      users = Array.isArray(cached.users) ? cached.users : [];
      documents = Array.isArray(cached.documents) ? cached.documents : [];
      models = Array.isArray(cached.models) ? cached.models : [];
      features = Array.isArray(cached.features) ? cached.features : [];
      series = Array.isArray(cached.series) ? cached.series : [];
      range = normalizeRange(cached.range);
      groupBy = normalizeGroupBy(cached.groupBy || cached.granularity);
      loading = false;
    }
    void fetchUsage({ background: Boolean(cached?.loaded) });
  });
</script>

<div class="usage-dashboard">
  <Card padding="md" border="default" className="usage-header-card">
    <div class="usage-header">
      <div class="usage-heading">
        <h2>Usage & Cost</h2>
        <p>Ledger-backed model usage, token volume, and cost.</p>
      </div>
      <Button type="button" variant="secondary" size="sm" on:click={() => fetchUsage({ background: Boolean(summary) })} disabled={loading || refreshing}>
        <span slot="icon" aria-hidden="true"><RefreshCw /></span>
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>

    <div class="filter-bar" aria-label="Usage filters">
      <div class="filter-group">
        <span class="filter-label">Date range</span>
        <div class="segmented-control" role="group" aria-label="Date range">
          {#each rangeOptions as option}
            <button
              type="button"
              class:active={range === option.value}
              aria-pressed={range === option.value}
              on:click={() => selectRange(option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">Group by</span>
        <div class="segmented-control" role="group" aria-label="Group by">
          {#each groupByOptions as option}
            <button
              type="button"
              class:active={groupBy === option.value}
              aria-pressed={groupBy === option.value}
              on:click={() => selectGroupBy(option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </Card>

  {#if error}
    <Card padding="sm" border="strong" variant="soft" className="usage-error-card">
      <AlertCircle aria-hidden="true" />
      <p>{error}</p>
    </Card>
  {/if}

  {#if loading && !summary}
    <Card padding="md" border="default" className="usage-state-card">
      <p>Loading usage data...</p>
    </Card>
  {:else if summary}
    <section class="metric-grid" aria-label="Key usage metrics">
      <Card padding="md" border="default" className="metric-card">
        <span class="metric-card__icon" aria-hidden="true"><DollarSign /></span>
        <span class="metric-card__label">Total Cost (USD)</span>
        <strong>{formatUsd(totalUsd)}</strong>
        <span class="metric-card__subtitle">{activeRange.subtitle}</span>
      </Card>

      <Card padding="md" border="default" className="metric-card">
        <span class="metric-card__icon" aria-hidden="true"><TrendingUp /></span>
        <span class="metric-card__label">Total Cost (SAR)</span>
        <strong>{formatSar(totalSar)}</strong>
        <span class="metric-card__subtitle">Fixed rate {formatRate(sarRate)}</span>
      </Card>

      <Card padding="md" border="default" className="metric-card">
        <span class="metric-card__icon" aria-hidden="true"><Zap /></span>
        <span class="metric-card__label">Total Tokens Used</span>
        <strong>{formatNumber(totals.totalTokens)}</strong>
        <span class="metric-card__subtitle">{activeRange.subtitle}</span>
      </Card>

      <Card padding="md" border="default" className="metric-card">
        <span class="metric-card__icon" aria-hidden="true"><Activity /></span>
        <span class="metric-card__label">Total AI Events</span>
        <strong>{formatNumber(totals.events)}</strong>
        <span class="metric-card__subtitle">{activeRange.subtitle}</span>
      </Card>
    </section>

    <Card padding="md" border="default" className="chart-card">
      <header class="section-heading">
        <h3>Cost Over Time</h3>
        <p>USD spend grouped by {activeGroupBy.label.toLowerCase()}.</p>
      </header>

      {#if series.length > 0}
        <div class="chart-shell">
          <UsageLineChart points={series} groupBy={groupBy} />
        </div>
      {:else}
        <div class="empty-state">
          <Activity aria-hidden="true" />
          <p>No usage data for this period.</p>
        </div>
      {/if}
    </Card>

    <UsageBreakdownTable
      title="Users by Cost"
      description="Sorted by USD spend."
      rows={users}
      type="users"
      paginated
      itemLabel="users"
    />

    <UsageBreakdownTable
      title="Documents by Cost"
      description="Sorted by USD spend."
      rows={documents}
      type="documents"
      paginated
      itemLabel="documents"
    />

    <div class="split-grid">
      <UsageBreakdownTable
        title="Features"
        description="AI usage by feature type"
        rows={features}
        type="features"
        compact
      />
      <UsageBreakdownTable
        title="Models"
        description="AI usage by model"
        rows={models}
        type="models"
        compact
      />
    </div>
  {/if}
</div>

<style>
  .usage-dashboard {
    display: grid;
    gap: var(--ui-space-5);
    min-width: 0;
  }

  :global(.usage-header-card),
  :global(.metric-card),
  :global(.chart-card),
  :global(.usage-state-card),
  :global(.usage-error-card) {
    border-radius: var(--ui-radius-lg);
  }

  .usage-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-4);
    min-width: 0;
  }

  .usage-heading {
    display: grid;
    gap: var(--ui-space-1);
    min-width: 0;
  }

  .usage-heading h2,
  .section-heading h3 {
    margin: 0;
    color: var(--ui-text-primary);
    font-weight: 600;
    letter-spacing: 0;
  }

  .usage-heading h2 {
    font-size: var(--ui-type-title-sm);
  }

  .usage-heading p,
  .section-heading p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .filter-bar {
    display: flex;
    align-items: flex-end;
    gap: var(--ui-space-4);
    flex-wrap: wrap;
    padding-top: var(--ui-space-4);
    border-top: 1px solid var(--ui-divider);
  }

  .filter-group {
    display: grid;
    gap: var(--ui-space-2);
    min-width: min(100%, 18rem);
  }

  .filter-label {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .segmented-control {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    overflow-x: auto;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 70%, transparent);
    padding: 0.25rem;
  }

  .segmented-control button {
    min-height: 2rem;
    border: 0;
    border-radius: calc(var(--ui-radius-md) - 0.25rem);
    background: transparent;
    color: var(--ui-text-secondary);
    cursor: pointer;
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
    padding: 0 0.8rem;
    white-space: nowrap;
    transition:
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .segmented-control button:hover {
    color: var(--ui-text-primary);
    background: color-mix(in srgb, var(--ui-text-primary) 6%, transparent);
  }

  .segmented-control button.active {
    color: var(--ui-bg-page);
    background: var(--ui-text-primary);
  }

  :global(.usage-error-card) {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    color: color-mix(in srgb, var(--ui-accent-danger) 76%, var(--ui-text-primary) 24%);
  }

  :global(.usage-error-card) :global(svg) {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
  }

  :global(.usage-error-card) p,
  :global(.usage-state-card) p {
    margin: 0;
    color: inherit;
    font-size: var(--ui-type-body-sm);
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--ui-space-4);
  }

  :global(.metric-card) {
    gap: var(--ui-space-2);
  }

  .metric-card__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: var(--ui-surface-secondary);
    color: var(--ui-text-primary);
  }

  .metric-card__icon :global(svg) {
    width: 1.05rem;
    height: 1.05rem;
  }

  .metric-card__label {
    margin-top: var(--ui-space-1);
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  :global(.metric-card) strong {
    color: var(--ui-text-primary);
    font-family: var(--font-family-mono);
    font-size: clamp(1.45rem, 1.1rem + 1.2vw, 2rem);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .metric-card__subtitle {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  :global(.chart-card) {
    gap: var(--ui-space-4);
  }

  .section-heading {
    display: grid;
    gap: var(--ui-space-1);
    min-width: 0;
  }

  .section-heading h3 {
    font-size: var(--ui-type-title-sm);
  }

  .chart-shell {
    min-height: 22rem;
    min-width: 0;
  }

  .empty-state {
    display: grid;
    place-items: center;
    gap: var(--ui-space-2);
    min-height: 18rem;
    border: 1px dashed var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 48%, transparent);
    color: var(--ui-text-muted);
    padding: var(--ui-space-6);
    text-align: center;
  }

  .empty-state :global(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }

  .empty-state p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  .split-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ui-space-4);
    min-width: 0;
  }

  @media (max-width: 1180px) {
    .metric-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .split-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .usage-dashboard {
      gap: var(--ui-space-4);
    }

    .usage-header {
      display: grid;
    }

    .filter-bar {
      display: grid;
      gap: var(--ui-space-3);
    }

    .filter-group {
      min-width: 0;
    }

    .metric-grid {
      grid-template-columns: 1fr;
    }

    .chart-shell {
      min-height: 18rem;
    }
  }
</style>
