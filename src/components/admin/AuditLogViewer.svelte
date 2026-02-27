<script>
  import { onMount } from 'svelte';
  import { API_BASE } from "../../config.js";


  let logs = [];
  let loading = true;
  let error = '';
  let actionFilter = 'all';
  let adminFilter = '';

  const actions = [
    'LIST_USERS',
    'VIEW_USER',
    'CREATE_USER',
    'UPDATE_USER',
    'SET_ROLE',
    'BAN_USER',
    'UNBAN_USER',
    'DELETE_USER',
    'VIEW_USER_FILES',
    'DELETE_USER_FILE',
    'VIEW_USER_SESSIONS',
    'REVOKE_SESSION',
    'REVOKE_USER_SESSIONS',
    'LIST_SESSIONS',
    'VIEW_STORAGE',
    'VIEW_ANALYTICS',
    'VIEW_AUDIT_LOGS'
  ];

  async function fetchLogs() {
    loading = true;
    error = '';

    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (adminFilter.trim()) params.set('adminId', adminFilter.trim());

      const response = await fetch(`${API_BASE}/api/admin/audit-logs?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audit logs');
      }

      logs = data.logs || [];
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  onMount(fetchLogs);
</script>

<section class="audit-panel">
  <header>
    <div>
      <h2>Audit Logs</h2>
      <p class="muted">Track sensitive admin activity and security events.</p>
    </div>
    <button on:click={fetchLogs}>Refresh</button>
  </header>

  <div class="filters">
    <select bind:value={actionFilter} on:change={fetchLogs}>
      <option value="all">All actions</option>
      {#each actions as action}
        <option value={action}>{action.replaceAll('_', ' ')}</option>
      {/each}
    </select>
    <input
      placeholder="Admin ID"
      bind:value={adminFilter}
      on:change={fetchLogs}
    />
  </div>

  {#if loading}
    <p class="muted">Loading logs...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Admin</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {#each logs as log}
            <tr>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.adminId}</td>
              <td>{log.action}</td>
              <td>{log.targetId || '-'}</td>
              <td class="details">{log.details ? JSON.stringify(log.details) : '-'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<style>
  .audit-panel {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.2);
    padding: 1.5rem;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
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

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .filters input,
  .filters select {
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 0.6rem;
    padding: 0.6rem 0.8rem;
    color: var(--color-text);
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
    vertical-align: top;
  }

  th {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
  }

  .details {
    max-width: 320px;
    word-break: break-word;
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  .muted {
    color: var(--color-text-secondary);
  }

  .error {
    color: #fca5a5;
  }
</style>
