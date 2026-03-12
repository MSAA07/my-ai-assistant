<script>
  import { onMount } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';

  const CACHE_KEY = 'page:admin:storage';

  let users = [];
  let loading = true;
  let refreshing = false;
  let error = '';

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0);
    if (!value) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const size = value / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  async function fetchStorage({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/storage`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch storage');
      }

      users = data.users || [];
      writePageCache(CACHE_KEY, { loaded: true, users });
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
      users = Array.isArray(cached.users) ? cached.users : [];
      loading = false;
    }
    void fetchStorage({ background: Boolean(cached?.loaded) });
  });
</script>

<DataSurface title="Storage Breakdown" description="Storage distribution by user account." tableMinWidth="700px">
  <Button slot="actions" type="button" variant="secondary" size="sm" on:click={() => fetchStorage({ background: users.length > 0 })} disabled={loading || refreshing}>
    {refreshing ? 'Refreshing...' : 'Refresh'}
  </Button>

  <svelte:fragment slot="state">
    {#if loading && users.length === 0}
      <p class="ui-data-state-note">Loading storage data...</p>
    {:else if error}
      <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
    {:else if users.length === 0}
      <p class="ui-data-state-note">No storage data available.</p>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="table">
    {#if !loading && !error && users.length > 0}
      <table class="ui-data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Documents</th>
            <th>Monthly Used</th>
            <th>Total Storage</th>
          </tr>
        </thead>
        <tbody>
          {#each users as user}
            <tr>
              <td>
                <strong>{user.name}</strong>
                <span class="muted">{user.email}</span>
              </td>
              <td>{user.documentCount}</td>
              <td>{user.documentsUsed}</td>
              <td>{formatBytes(user.storageUsed)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </svelte:fragment>
</DataSurface>

<style>
  .muted {
    color: var(--color-text-secondary);
    margin: 0.3rem 0 0;
    display: block;
  }
</style>
