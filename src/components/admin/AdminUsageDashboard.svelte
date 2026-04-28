<script>
  import { onMount } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import UsageBreakdownTable from './UsageBreakdownTable.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';

  const CACHE_KEY = 'page:admin:usage';
  const granularities = ['hour', 'day', 'week', 'month', 'year'];
  const ranges = [
    { value: '24h', label: 'Last 24h' },
    { value: '7d', label: 'Last 7d' },
    { value: '30d', label: 'Last 30d' },
    { value: 'custom', label: 'Custom' }
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
  let granularity = 'day';
  let fromDate = '';
  let toDate = '';
  let featureFilter = 'all';
  let modelFilter = 'all';
  let statusFilter = 'all';
  let billableFilter = 'true';

  function formatUsd(value) {
    return `$${Number(value || 0).toFixed(4)}`;
  }

  function formatSar(value) {
    return `${Number(value || 0).toFixed(2)} SAR`;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString() : '-';
  }

  function setRangeDates(params) {
    if (range === 'custom') {
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      return;
    }

    const now = new Date();
    const from = new Date(now);
    if (range === '24h') from.setHours(from.getHours() - 24);
    if (range === '7d') from.setDate(from.getDate() - 7);
    if (range === '30d') from.setDate(from.getDate() - 30);
    params.set('from', from.toISOString());
    params.set('to', now.toISOString());
  }

  function buildQuery(extra = {}) {
    const params = new URLSearchParams();
    setRangeDates(params);
    if (featureFilter !== 'all') params.set('featureKey', featureFilter);
    if (modelFilter !== 'all') params.set('model', modelFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (billableFilter !== 'all') params.set('billable', billableFilter);
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== null && value !== '') params.set(key, value);
    }
    return params.toString();
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
      const [summaryData, usersData, documentsData, modelsData, featuresData, timeData] = await Promise.all([
        fetchJson(`/api/admin/usage/summary?${baseQuery}`),
        fetchJson(`/api/admin/usage/users?${baseQuery}`),
        fetchJson(`/api/admin/usage/documents?${baseQuery}`),
        fetchJson(`/api/admin/usage/models?${baseQuery}`),
        fetchJson(`/api/admin/usage/features?${baseQuery}`),
        fetchJson(`/api/admin/usage/timeseries?${buildQuery({ granularity })}`)
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
        granularity,
        fromDate,
        toDate,
        featureFilter,
        modelFilter,
        statusFilter,
        billableFilter
      });
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

  onMount(() => {
    const cached = readPageCache(CACHE_KEY);
    if (cached?.loaded) {
      summary = cached.summary || null;
      users = Array.isArray(cached.users) ? cached.users : [];
      documents = Array.isArray(cached.documents) ? cached.documents : [];
      models = Array.isArray(cached.models) ? cached.models : [];
      features = Array.isArray(cached.features) ? cached.features : [];
      series = Array.isArray(cached.series) ? cached.series : [];
      range = cached.range || '30d';
      granularity = cached.granularity || 'day';
      fromDate = cached.fromDate || '';
      toDate = cached.toDate || '';
      featureFilter = cached.featureFilter || 'all';
      modelFilter = cached.modelFilter || 'all';
      statusFilter = cached.statusFilter || 'all';
      billableFilter = cached.billableFilter || 'true';
      loading = false;
    }
    void fetchUsage({ background: Boolean(cached?.loaded) });
  });
</script>

<div class="usage-dashboard">
  <DataSurface title="Usage & Cost" description="Ledger-backed model usage, token volume, and cost." tableMinWidth="980px">
    <Button slot="actions" type="button" variant="secondary" size="sm" on:click={() => fetchUsage({ background: Boolean(summary) })} disabled={loading || refreshing}>
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </Button>

    <svelte:fragment slot="filters">
      <FieldShell className="filter-field" label="Range">
        <select bind:value={range} on:change={() => fetchUsage({ background: Boolean(summary) })}>
          {#each ranges as item}
            <option value={item.value}>{item.label}</option>
          {/each}
        </select>
      </FieldShell>
      <FieldShell className="filter-field" label="Granularity">
        <select bind:value={granularity} on:change={() => fetchUsage({ background: Boolean(summary) })}>
          {#each granularities as item}
            <option value={item}>{item}</option>
          {/each}
        </select>
      </FieldShell>
      <FieldShell className="filter-field" label="Feature">
        <select bind:value={featureFilter} on:change={() => fetchUsage({ background: Boolean(summary) })}>
          <option value="all">All features</option>
          {#each features as feature}
            <option value={feature.featureKey}>{feature.featureKey}</option>
          {/each}
        </select>
      </FieldShell>
      <FieldShell className="filter-field" label="Model">
        <select bind:value={modelFilter} on:change={() => fetchUsage({ background: Boolean(summary) })}>
          <option value="all">All models</option>
          {#each models as model}
            <option value={model.model}>{model.model}</option>
          {/each}
        </select>
      </FieldShell>
      <FieldShell className="filter-field" label="Status">
        <select bind:value={statusFilter} on:change={() => fetchUsage({ background: Boolean(summary) })}>
          <option value="all">All status</option>
          <option value="succeeded">Succeeded</option>
          <option value="failed">Failed</option>
        </select>
      </FieldShell>
      <FieldShell className="filter-field" label="Billable">
        <select bind:value={billableFilter} on:change={() => fetchUsage({ background: Boolean(summary) })}>
          <option value="true">Billable</option>
          <option value="false">Non-billable</option>
          <option value="all">All</option>
        </select>
      </FieldShell>
      {#if range === 'custom'}
        <FieldShell className="filter-field" label="From">
          <input type="date" bind:value={fromDate} on:change={() => fetchUsage({ background: Boolean(summary) })} />
        </FieldShell>
        <FieldShell className="filter-field" label="To">
          <input type="date" bind:value={toDate} on:change={() => fetchUsage({ background: Boolean(summary) })} />
        </FieldShell>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="panels">
      {#if summary}
        <div class="metric-grid">
          <div><span>USD Cost</span><strong>{formatUsd(summary.totals.costUsd)}</strong></div>
          <div><span>SAR Approx.</span><strong>{formatSar(summary.totals.costSar)}</strong></div>
          <div><span>Total Tokens</span><strong>{formatNumber(summary.totals.totalTokens)}</strong></div>
          <div><span>Input Tokens</span><strong>{formatNumber(summary.totals.inputTokens)}</strong></div>
          <div><span>Output Tokens</span><strong>{formatNumber(summary.totals.outputTokens)}</strong></div>
          <div><span>Events</span><strong>{formatNumber(summary.totals.events)}</strong></div>
        </div>
        <p class="sar-note">SAR uses fixed rate {summary.sarRate} and is approximate.</p>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="state">
      {#if loading && !summary}
        <p class="ui-data-state-note">Loading usage data...</p>
      {:else if error}
        <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
      {/if}
    </svelte:fragment>
  </DataSurface>

  <DataSurface title="Time Series" description="Cost and token totals grouped by selected granularity." tableMinWidth="840px">
    <svelte:fragment slot="table">
      {#if !loading && !error && series.length > 0}
        <table class="ui-data-table">
          <thead>
            <tr>
              <th>Bucket</th>
              <th>Events</th>
              <th>Input</th>
              <th>Output</th>
              <th>Total</th>
              <th>USD</th>
              <th>SAR</th>
            </tr>
          </thead>
          <tbody>
            {#each series as item}
              <tr>
                <td><strong>{formatDate(item.bucketStart)}</strong></td>
                <td>{formatNumber(item.events)}</td>
                <td>{formatNumber(item.inputTokens)}</td>
                <td>{formatNumber(item.outputTokens)}</td>
                <td>{formatNumber(item.totalTokens)}</td>
                <td>{formatUsd(item.costUsd)}</td>
                <td>{formatSar(item.costSar)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else if !loading && !error}
        <p class="ui-data-state-note">No usage events in this time range.</p>
      {/if}
    </svelte:fragment>
  </DataSurface>

  <div class="breakdown-grid">
    <UsageBreakdownTable title="Users" rows={users} nameKey="user" idKey="userId" />
    <UsageBreakdownTable title="Documents" rows={documents} nameKey="document" idKey="documentId" />
    <UsageBreakdownTable title="Features" rows={features} labelKey="featureKey" />
    <UsageBreakdownTable title="Models" rows={models} labelKey="model" />
  </div>
</div>

<style>
  .usage-dashboard {
    display: grid;
    gap: var(--ui-space-4);
    min-width: 0;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: var(--ui-space-3);
  }

  .metric-grid div {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    padding: var(--ui-space-3);
    background: var(--ui-surface-secondary);
  }

  .metric-grid span,
  .sar-note {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-body-xs);
  }

  .metric-grid strong {
    color: var(--ui-text-primary);
    font-size: var(--ui-type-title-sm);
  }

  .sar-note {
    margin: 0;
  }

  .breakdown-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ui-space-4);
  }

  @media (max-width: 1180px) {
    .metric-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .breakdown-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .metric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
