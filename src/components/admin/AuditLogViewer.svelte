<script>
  import { onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';

  const CACHE_KEY = 'page:admin:audit';

  let logs = [];
  let loading = true;
  let refreshing = false;
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

  async function fetchLogs({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

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
      writePageCache(CACHE_KEY, {
        loaded: true,
        logs,
        actionFilter,
        adminFilter
      });
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
      logs = Array.isArray(cached.logs) ? cached.logs : [];
      actionFilter = cached.actionFilter || 'all';
      adminFilter = cached.adminFilter || '';
      loading = false;
    }
    void fetchLogs({ background: Boolean(cached?.loaded) });
  });
</script>

<DataSurface title="Audit Logs" description="Track sensitive admin activity and security events." tableMinWidth="1040px">
  <Button slot="actions" type="button" variant="secondary" size="sm" on:click={() => fetchLogs({ background: logs.length > 0 })} disabled={loading || refreshing}>
    {refreshing ? 'Refreshing...' : 'Refresh'}
  </Button>

  <svelte:fragment slot="filters">
    <FieldShell className="filter-field" label="Action">
      <select bind:value={actionFilter} on:change={() => fetchLogs({ background: logs.length > 0 })}>
        <option value="all">All actions</option>
        {#each actions as action}
          <option value={action}>{action.replaceAll('_', ' ')}</option>
        {/each}
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label="Admin ID">
      <input placeholder="Admin ID" bind:value={adminFilter} on:change={() => fetchLogs({ background: logs.length > 0 })} />
    </FieldShell>
  </svelte:fragment>

  <svelte:fragment slot="state">
    {#if loading && logs.length === 0}
      <p class="ui-data-state-note">Loading logs...</p>
    {:else if error}
      <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
    {:else if logs.length === 0}
      <p class="ui-data-state-note">No logs match the current filters.</p>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="table">
    {#if !loading && !error && logs.length > 0}
      <table class="ui-data-table">
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
              <td class="admin-id">{log.adminId}</td>
              <td>
                <Badge tone="neutral" size="xs" uppercase>{log.action.replaceAll('_', ' ')}</Badge>
              </td>
              <td>{log.targetId || '-'}</td>
              <td class="details">{log.details ? JSON.stringify(log.details) : '-'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </svelte:fragment>
</DataSurface>

<style>
  .admin-id {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .details {
    max-width: 420px;
    word-break: break-word;
    font-size: var(--font-size-xs);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    color: var(--color-text-secondary);
  }
</style>
