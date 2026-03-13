<script>
  import { onMount } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';

  const CACHE_KEY = 'page:admin:stats';

  let stats = null;
  let loading = true;
  let refreshing = false;
  let error = '';

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0);
    if (value === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const size = value / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  async function fetchStats({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/analytics`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      stats = data;
      writePageCache(CACHE_KEY, { loaded: true, stats });
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
    if (cached?.loaded && cached?.stats) {
      stats = cached.stats;
      loading = false;
    }
    void fetchStats({ background: Boolean(cached?.loaded && cached?.stats) });
  });
</script>

<DataSurface
  className="admin-overview"
  title="Platform Overview"
  description="Key activity and usage indicators."
  tableMinWidth="640px"
  compact
>
  <Button slot="actions" type="button" variant="secondary" size="sm" on:click={() => fetchStats({ background: Boolean(stats) })} disabled={loading || refreshing}>
    {refreshing ? 'Refreshing...' : 'Refresh'}
  </Button>

  <svelte:fragment slot="state">
    {#if loading && !stats}
      <p class="ui-data-state-note">Loading analytics...</p>
    {:else if error}
      <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
    {/if}
  </svelte:fragment>

  {#if !loading && !error && stats}
    <div class="stats-grid">
      <Card class="metric-card" variant="base" padding="sm" border="subtle">
        <p class="metric-label">Total Users</p>
        <p class="metric-value">{stats.totals.users}</p>
        <p class="metric-meta">Active 24h: {stats.activeUsers.last24h}</p>
      </Card>
      <Card class="metric-card" variant="base" padding="sm" border="subtle">
        <p class="metric-label">Documents</p>
        <p class="metric-value">{stats.totals.documents}</p>
        <p class="metric-meta">Active 7d: {stats.activeUsers.last7d}</p>
      </Card>
      <Card class="metric-card" variant="base" padding="sm" border="subtle">
        <p class="metric-label">Storage Processed</p>
        <p class="metric-value">{formatBytes(stats.totals.storageBytes)}</p>
        <p class="metric-meta">Active 30d: {stats.activeUsers.last30d}</p>
      </Card>
      <Card class="metric-card" variant="base" padding="sm" border="subtle">
        <p class="metric-label">Active Sessions</p>
        <p class="metric-value">{stats.totals.activeSessions}</p>
        <p class="metric-meta">Across all devices</p>
      </Card>
    </div>
  {/if}
</DataSurface>

<style>
  :global(.admin-overview) {
    gap: 0.875rem;
    border-color: color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    box-shadow: none;
    background: color-mix(in srgb, var(--card) 96%, transparent);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
  }

  :global(.metric-card) {
    gap: 0.35rem;
    min-height: 104px;
    border-color: color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    box-shadow: none;
    background: color-mix(in srgb, var(--card) 98%, transparent);
  }

  .metric-label,
  .metric-value,
  .metric-meta {
    margin: 0;
  }

  .metric-label {
    color: var(--muted-foreground);
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .metric-value {
    color: var(--foreground);
    font-size: clamp(1.8rem, 2vw, 2rem);
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .metric-meta {
    color: var(--muted-foreground);
    font-size: 0.78rem;
    line-height: 1.35;
  }

  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
