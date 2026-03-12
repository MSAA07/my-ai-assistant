<script>
  import { onMount } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import { API_BASE } from '../../config.js';

  let sessions = [];
  let loading = true;
  let error = '';

  async function fetchSessions() {
    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_BASE}/api/admin/sessions`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      sessions = data.sessions || [];
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function revokeSession(sessionId) {
    await fetch(`${API_BASE}/api/admin/sessions/${sessionId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await fetchSessions();
  }

  onMount(fetchSessions);
</script>

<div class="session-manager">
  <Card class="admin-panel" variant="base" padding="md">
    <header class="panel-header">
      <div>
        <h2>Active Sessions</h2>
        <p class="muted">Current active login sessions across users.</p>
      </div>
      <Button type="button" variant="secondary" size="sm" on:click={fetchSessions}>Refresh</Button>
    </header>

    {#if loading}
      <p class="muted">Loading sessions...</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>IP Address</th>
              <th>User Agent</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each sessions as session}
              <tr>
                <td>
                  <strong>{session.user?.name || 'Unknown'}</strong>
                  <span class="muted">{session.user?.email || ''}</span>
                </td>
                <td>{session.ipAddress || '-'}</td>
                <td class="agent">{session.userAgent || '-'}</td>
                <td>{new Date(session.expiresAt).toLocaleString()}</td>
                <td>
                  <Button type="button" size="sm" variant="danger" on:click={() => revokeSession(session.id)}>
                    Revoke
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card>
</div>

<style>
  .session-manager :global(.admin-panel) {
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
    color: var(--color-danger-soft);
    margin: 0;
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

  .agent {
    max-width: 260px;
    word-break: break-word;
  }
</style>
