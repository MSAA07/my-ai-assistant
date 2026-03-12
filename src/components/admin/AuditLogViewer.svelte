<script>
  import { onMount } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { API_BASE } from '../../config.js';

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

<div class="audit-log-viewer">
  <Card class="admin-panel" variant="base" padding="md">
    <header class="panel-header">
      <div>
        <h2>Audit Logs</h2>
        <p class="muted">Track sensitive admin activity and security events.</p>
      </div>
      <Button type="button" variant="secondary" size="sm" on:click={fetchLogs}>Refresh</Button>
    </header>

    <div class="filters">
      <FieldShell label="Action">
        <select bind:value={actionFilter} on:change={fetchLogs}>
          <option value="all">All actions</option>
          {#each actions as action}
            <option value={action}>{action.replaceAll('_', ' ')}</option>
          {/each}
        </select>
      </FieldShell>

      <FieldShell label="Admin ID">
        <input placeholder="Admin ID" bind:value={adminFilter} on:change={fetchLogs} />
      </FieldShell>
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
  </Card>
</div>

<style>
  .audit-log-viewer :global(.admin-panel) {
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
    margin: 0;
    color: var(--color-danger-soft);
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
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
    vertical-align: top;
  }

  th {
    font-size: var(--font-size-xs);
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
</style>
