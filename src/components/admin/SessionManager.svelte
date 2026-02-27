<script>
  import { onMount } from 'svelte';
  import { API_BASE } from "../../config.js";


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

<section class="session-panel">
  <header>
    <h2>Active Sessions</h2>
    <button on:click={fetchSessions}>Refresh</button>
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
                <button class="danger" on:click={() => revokeSession(session.id)}>Revoke</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<style>
  .session-panel {
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
    vertical-align: top;
  }

  th {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
  }

  .agent {
    max-width: 260px;
    word-break: break-word;
  }

  .danger {
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #fca5a5;
    background: transparent;
    border-radius: 999px;
    padding: 0.3rem 0.8rem;
  }

  .muted {
    color: var(--color-text-secondary);
    display: block;
  }

  .error {
    color: #fca5a5;
  }
</style>
