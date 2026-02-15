<script>
  import { onMount } from 'svelte';

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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

<section class="storage-panel">
  <header>
    <h2>Storage Breakdown</h2>
    <button on:click={fetchStorage}>Refresh</button>
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
</section>

<style>
  .storage-panel {
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

  button {
    padding: 0.4rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.4);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
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
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    text-align: left;
  }

  th {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
  }

  .muted {
    color: var(--color-text-secondary);
    display: block;
  }

  .error {
    color: #fca5a5;
  }
</style>
