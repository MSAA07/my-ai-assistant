<script>
  import { onMount } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';

  const CACHE_KEY = 'page:admin:sessions';

  let sessions = [];
  let loading = true;
  let refreshing = false;
  let error = '';

  async function fetchSessions({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/sessions`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      sessions = data.sessions || [];
      writePageCache(CACHE_KEY, { loaded: true, sessions });
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

  async function revokeSession(sessionId) {
    await fetch(`${API_BASE}/api/admin/sessions/${sessionId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await fetchSessions({ background: true });
  }

  onMount(() => {
    const cached = readPageCache(CACHE_KEY);
    if (cached?.loaded) {
      sessions = Array.isArray(cached.sessions) ? cached.sessions : [];
      loading = false;
    }
    void fetchSessions({ background: Boolean(cached?.loaded) });
  });
</script>

<DataSurface title="Active Sessions" description="Current active login sessions across users." tableMinWidth="760px">
  <Button slot="actions" type="button" variant="secondary" size="sm" on:click={() => fetchSessions({ background: sessions.length > 0 })} disabled={loading || refreshing}>
    {refreshing ? 'Refreshing...' : 'Refresh'}
  </Button>

  <svelte:fragment slot="state">
    {#if loading && sessions.length === 0}
      <p class="ui-data-state-note">Loading sessions...</p>
    {:else if error}
      <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
    {:else if sessions.length === 0}
      <p class="ui-data-state-note">No active sessions.</p>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="table">
    {#if !loading && !error && sessions.length > 0}
      <table class="ui-data-table">
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
    {/if}
  </svelte:fragment>
</DataSurface>

<style>
  .muted {
    color: var(--color-text-secondary);
    margin: 0.3rem 0 0;
    display: block;
  }

  .agent {
    max-width: 260px;
    word-break: break-word;
  }
</style>
