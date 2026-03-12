<script>
  import { onMount } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import { API_BASE } from '../../config.js';

  let users = [];
  let loading = true;
  let error = '';

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0);
    if (!value) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const size = value / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  async function fetchStorage() {
    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_BASE}/api/admin/storage`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch storage');
      }

      users = data.users || [];
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  onMount(fetchStorage);
</script>

<div class="storage-overview">
  <Card class="admin-panel" variant="base" padding="md">
    <header class="panel-header">
      <div>
        <h2>Storage Breakdown</h2>
        <p class="muted">Storage distribution by user account.</p>
      </div>
      <Button type="button" variant="secondary" size="sm" on:click={fetchStorage}>Refresh</Button>
    </header>

    {#if loading}
      <p class="muted">Loading storage data...</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else}
      <div class="table-wrap">
        <table>
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
      </div>
    {/if}
  </Card>
</div>

<style>
  .storage-overview :global(.admin-panel) {
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
    display: block;
  }

  .error {
    margin: 0;
    color: var(--color-danger-soft);
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--ui-border-subtle);
    text-align: start;
  }

  th {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
  }
</style>
