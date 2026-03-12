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

<DataSurface title="Platform Overview" description="Key activity and usage indicators.">
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
      <Card class="admin-stat-card" variant="soft" padding="md" border="subtle">
        <p class="label">Total Users</p>
        <h3>{stats.totals.users}</h3>
        <span class="meta">Active 24h: {stats.activeUsers.last24h}</span>
      </Card>
      <Card class="admin-stat-card" variant="soft" padding="md" border="subtle">
        <p class="label">Documents</p>
        <h3>{stats.totals.documents}</h3>
        <span class="meta">Active 7d: {stats.activeUsers.last7d}</span>
      </Card>
      <Card class="admin-stat-card" variant="soft" padding="md" border="subtle">
        <p class="label">Storage Processed</p>
        <h3>{formatBytes(stats.totals.storageBytes)}</h3>
        <span class="meta">Active 30d: {stats.activeUsers.last30d}</span>
      </Card>
      <Card class="admin-stat-card" variant="soft" padding="md" border="subtle">
        <p class="label">Active Sessions</p>
        <h3>{stats.totals.activeSessions}</h3>
        <span class="meta">Across all devices</span>
      </Card>
    </div>
  {/if}
</DataSurface>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
  }

  .stats-grid :global(.admin-stat-card) {
    gap: 0.35rem;
  }

  .label {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h3 {
    margin: 0;
    font-size: 1.55rem;
    color: var(--color-text-primary);
  }

  .meta {
    font-size: var(--font-size-xs);
    color: var(--color-text-faint);
  }
</style>
