<script>
  import { onMount } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import { API_BASE } from '../../config.js';

  let stats = null;
  let loading = true;
  let error = '';

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0);
    if (value === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const size = value / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  async function fetchStats() {
    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_BASE}/api/admin/analytics`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      stats = data;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  onMount(fetchStats);
</script>

<div class="admin-stats">
  <Card class="admin-panel" variant="base" padding="md">
    <header class="panel-header">
      <div>
        <h2>Platform Overview</h2>
        <p class="muted">Key activity and usage indicators.</p>
      </div>
      <Button type="button" variant="secondary" size="sm" on:click={fetchStats}>Refresh</Button>
    </header>

    {#if loading}
      <p class="muted">Loading analytics...</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else if stats}
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
  </Card>
</div>

<style>
  .admin-stats :global(.admin-panel) {
    gap: var(--space-4);
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  h2 {
    margin: 0;
    color: var(--color-text-primary);
  }

  .muted {
    color: var(--color-text-secondary);
    margin: 0.3rem 0 0;
  }

  .error {
    color: var(--color-danger-soft);
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
  }

  .admin-stats :global(.admin-stat-card) {
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
