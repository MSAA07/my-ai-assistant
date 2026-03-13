<script>
  import { onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import StatCard from '../../lib/components/ui/StatCard.svelte';
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

<DataSurface className="admin-overview" title="Platform Overview" description="Key activity and usage indicators across usage, storage, and sessions." tableMinWidth="640px">
  <div slot="header" class="overview-header">
    <div class="overview-copy">
      <p class="eyebrow">Overview</p>
      <h2>Platform Overview</h2>
      <p>Key activity and usage indicators across users, document volume, storage, and active sessions.</p>
    </div>
    <Badge tone="accent" variant="soft" size="sm">Analytics</Badge>
  </div>

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
      <StatCard className="admin-stat-card" tone="info" label="Total Users" value={stats.totals.users} meta={`Active 24h: ${stats.activeUsers.last24h}`} />
      <StatCard className="admin-stat-card" tone="neutral" label="Documents" value={stats.totals.documents} meta={`Active 7d: ${stats.activeUsers.last7d}`} />
      <StatCard className="admin-stat-card" tone="warning" label="Storage Processed" value={formatBytes(stats.totals.storageBytes)} meta={`Active 30d: ${stats.activeUsers.last30d}`} />
      <StatCard className="admin-stat-card" tone="success" label="Active Sessions" value={stats.totals.activeSessions} meta="Across all devices" />
    </div>
  {/if}
</DataSurface>

<style>
  .overview-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .overview-copy {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
  }

  .eyebrow {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.67rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }

  .overview-copy h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--foreground);
  }

  .overview-copy p:last-child {
    margin: 0;
    color: var(--muted-foreground);
    font-size: var(--font-size-sm);
    line-height: 1.55;
    max-width: 52rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }

  .stats-grid :global(.admin-stat-card) {
    min-height: 128px;
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
