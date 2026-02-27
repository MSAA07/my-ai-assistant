<script>
  import { onMount } from 'svelte';
  import { API_BASE } from "../../config.js";


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

<section class="stats-panel">
  <header>
    <h2>Platform Overview</h2>
    <button on:click={fetchStats}>Refresh</button>
  </header>

  {#if loading}
    <p class="muted">Loading analytics...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if stats}
    <div class="stats-grid">
      <div class="stat-card">
        <p class="label">Total Users</p>
        <h3>{stats.totals.users}</h3>
        <span class="meta">Active 24h: {stats.activeUsers.last24h}</span>
      </div>
      <div class="stat-card">
        <p class="label">Documents</p>
        <h3>{stats.totals.documents}</h3>
        <span class="meta">Active 7d: {stats.activeUsers.last7d}</span>
      </div>
      <div class="stat-card">
        <p class="label">Storage Processed</p>
        <h3>{formatBytes(stats.totals.storageBytes)}</h3>
        <span class="meta">Active 30d: {stats.activeUsers.last30d}</span>
      </div>
      <div class="stat-card">
        <p class="label">Active Sessions</p>
        <h3>{stats.totals.activeSessions}</h3>
        <span class="meta">Across all devices</span>
      </div>
    </div>
  {/if}
</section>

<style>
  .stats-panel {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.2);
    padding: 1.5rem;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  h2 {
    margin: 0;
    color: var(--color-text);
  }

  button {
    padding: 0.45rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.4);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background: rgba(96, 165, 250, 0.15);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.9rem;
    padding: 1rem;
  }

  .label {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    margin: 0 0 0.5rem;
  }

  h3 {
    margin: 0 0 0.35rem;
    font-size: 1.6rem;
    color: var(--color-text);
  }

  .meta {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .muted {
    color: var(--color-text-secondary);
  }

  .error {
    color: #fca5a5;
  }
</style>
