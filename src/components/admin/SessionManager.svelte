<script>
  import { onDestroy, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import ConfirmModal from '../../lib/components/ui/ConfirmModal.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import SectionState from '../../lib/components/ui/SectionState.svelte';
  import { API_BASE } from '../../config.js';
  import { router } from '../../stores/router.js';
  import { toast } from '../../stores/toasts.js';
  import { buildAdminUserPath, buildSessionsQuery, revokeAllConfirmation, runSecurityMutation } from '../../lib/admin/securityAccess.js';

  export let userId = '';

  let sessions = [];
  let loading = true;
  let refreshing = false;
  let error = '';
  let total = 0;
  let limit = 25;
  let offset = 0;
  let userFilter = userId || '';
  let kpis = { active: 0, revokedToday: 0, expiredExcluded: 0 };
  let lastUpdatedAt = null;
  let clock = Date.now();
  let clockTimer;
  let busyKey = '';
  let confirmConfig = null;
  let pendingConfirmAction = null;

  $: currentPage = Math.floor(offset / limit) + 1;
  $: totalPages = Math.max(1, Math.ceil(total / limit));
  $: pageStart = total === 0 ? 0 : offset + 1;
  $: pageEnd = Math.min(offset + sessions.length, total);
  $: freshness = formatRelative(lastUpdatedAt, clock);

  function formatRelative(value, now) {
    if (!value) return 'Not updated yet';
    const seconds = Math.max(0, Math.floor((now - value) / 1000));
    if (seconds < 5) return 'Updated just now';
    if (seconds < 60) return `Updated ${seconds}s ago`;
    return `Updated ${Math.floor(seconds / 60)}m ago`;
  }

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function fetchSessions({ background = false, resetPage = false } = {}) {
    if (resetPage) offset = 0;
    if (background) refreshing = true;
    else { loading = true; error = ''; }
    try {
      const query = buildSessionsQuery({ limit, offset, userId: userFilter });
      const data = await fetchJson(`/api/admin/sessions?${query}`);
      sessions = data.sessions || [];
      total = Number(data.total || 0);
      limit = Number(data.limit || limit);
      offset = Number(data.offset || 0);
      kpis = {
        active: Number(data.kpis?.active ?? total),
        revokedToday: Number(data.kpis?.revokedToday || 0),
        expiredExcluded: Number(data.kpis?.expiredExcluded || 0)
      };
      lastUpdatedAt = Date.now();
      error = '';
    } catch (err) {
      error = err.message || 'Failed to load sessions';
    } finally {
      loading = false;
      refreshing = false;
    }
  }

  function applyRevokeSuccess({ sessionId = null, targetUserId = null, activeRevoked = 1 }) {
    const removedFromPage = sessions.filter((session) => sessionId ? session.id === sessionId : session.userId === targetUserId).length;
    sessions = sessions.filter((session) => sessionId ? session.id !== sessionId : session.userId !== targetUserId);
    const revoked = Math.max(Number(activeRevoked || removedFromPage || 1), 0);
    total = Math.max(0, total - revoked);
    kpis = { ...kpis, active: Math.max(0, kpis.active - revoked), revokedToday: kpis.revokedToday + revoked };
    lastUpdatedAt = Date.now();
  }

  async function revokeSession(session) {
    busyKey = `session-${session.id}`;
    await runSecurityMutation({
      request: () => fetchJson(`/api/admin/sessions/${session.id}`, { method: 'DELETE' }),
      successMessage: 'Session revoked.', toastApi: toast,
      onSuccess: () => applyRevokeSuccess({ sessionId: session.id, activeRevoked: 1 })
    });
    busyKey = '';
  }

  function requestRevokeAll(session) {
    confirmConfig = revokeAllConfirmation(session.user);
    pendingConfirmAction = async () => {
      busyKey = `user-${session.userId}`;
      const result = await runSecurityMutation({
        request: () => fetchJson(`/api/admin/users/${session.userId}/sessions`, { method: 'DELETE' }),
        successMessage: 'All user sessions revoked.', toastApi: toast,
        onSuccess: (data) => applyRevokeSuccess({ targetUserId: session.userId, activeRevoked: Number(data.activeRevoked || 0) })
      });
      busyKey = '';
      if (result.ok) closeConfirmation();
    };
  }

  function closeConfirmation() {
    if (busyKey) return;
    confirmConfig = null;
    pendingConfirmAction = null;
  }

  function applyFilter() { void fetchSessions({ resetPage: true }); }
  function clearUserFilter() {
    userFilter = '';
    router.navigate('/admin/security?view=sessions', { replace: true });
    void fetchSessions({ resetPage: true });
  }
  function changePage(nextPage) {
    offset = (Math.min(Math.max(nextPage, 1), totalPages) - 1) * limit;
    void fetchSessions({ background: true });
  }

  onMount(() => {
    void fetchSessions();
    clockTimer = window.setInterval(() => (clock = Date.now()), 1000);
  });
  onDestroy(() => { if (clockTimer) window.clearInterval(clockTimer); });
</script>

<section class="security-subview" aria-labelledby="sessions-heading">
  <div class="kpi-grid" aria-label="Session metrics">
    <Card variant="base" border="subtle" padding="md"><span>Active sessions</span><strong>{kpis.active}</strong></Card>
    <Card variant="base" border="subtle" padding="md"><span>Revoked today</span><strong>{kpis.revokedToday}</strong></Card>
    <Card variant="base" border="subtle" padding="md"><span>Expired excluded</span><strong>{kpis.expiredExcluded}</strong></Card>
  </div>

  <DataSurface title="Sessions" description="Who is signed in right now. Expired records are excluded from this active list." tableMinWidth="1120px">
    <svelte:fragment slot="actions">
      <span class="freshness" aria-live="polite">{freshness}</span>
      <Button type="button" variant="secondary" size="sm" on:click={() => fetchSessions({ background: sessions.length > 0 })} disabled={loading || refreshing}>{refreshing ? 'Refreshing...' : 'Refresh'}</Button>
    </svelte:fragment>

    <svelte:fragment slot="filters">
      <FieldShell className="filter-field" label="User ID"><input placeholder="Filter by user ID" bind:value={userFilter} on:change={applyFilter} /></FieldShell>
      {#if userFilter}<Button type="button" variant="ghost" size="sm" on:click={clearUserFilter}>Clear user filter</Button>{/if}
      <p class="excluded-note">{kpis.expiredExcluded} expired {kpis.expiredExcluded === 1 ? 'session' : 'sessions'} automatically excluded.</p>
    </svelte:fragment>

    <svelte:fragment slot="state">
      {#if loading && sessions.length === 0}<SectionState message="Loading active sessions..." />
      {:else if error}<SectionState message={error} error retry={() => fetchSessions()} />
      {:else if sessions.length === 0}<SectionState message="No active sessions match this filter." />{/if}
    </svelte:fragment>

    <svelte:fragment slot="table">
      {#if !loading && !error && sessions.length > 0}
        <table class="ui-data-table">
          <thead><tr><th>User</th><th>Device / IP</th><th>Created</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {#each sessions as session (session.id)}
              <tr>
                <td><button class="user-link" type="button" on:click={() => router.navigate(buildAdminUserPath(session.userId))}><span class="avatar" aria-hidden="true">{(session.user?.name || session.user?.email || '?').slice(0, 1).toUpperCase()}</span><span><strong>{session.user?.name || 'Unknown user'}</strong><small>{session.user?.email || session.userId}</small></span></button></td>
                <td><strong>{session.ipAddress || 'Unknown IP'}</strong><span class="muted agent">{session.userAgent || 'Unknown device'}</span></td>
                <td>{new Date(session.createdAt).toLocaleString()}</td>
                <td>{new Date(session.expiresAt).toLocaleString()}</td>
                <td><Badge tone="success" size="xs">Active</Badge></td>
                <td class="actions-cell"><Button type="button" size="sm" variant="danger" loading={busyKey === `session-${session.id}`} disabled={Boolean(busyKey)} on:click={() => revokeSession(session)}>Revoke</Button><Button type="button" size="sm" variant="warning" disabled={Boolean(busyKey)} on:click={() => requestRevokeAll(session)}>Revoke all for user</Button></td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div class="pagination-bar"><p>Showing {pageStart}-{pageEnd} of {total} active sessions</p><div><Button type="button" variant="secondary" size="sm" disabled={currentPage <= 1 || refreshing} on:click={() => changePage(currentPage - 1)}>Previous</Button><span>Page {currentPage} of {totalPages}</span><Button type="button" variant="secondary" size="sm" disabled={currentPage >= totalPages || refreshing} on:click={() => changePage(currentPage + 1)}>Next</Button></div></div>
      {/if}
    </svelte:fragment>
  </DataSurface>
</section>

{#if confirmConfig}<ConfirmModal open title={confirmConfig.title} description={confirmConfig.description} confirmLabel={confirmConfig.confirmLabel} severity={confirmConfig.severity} typedConfirmation={confirmConfig.typedConfirmation} busy={Boolean(busyKey)} on:cancel={closeConfirmation} on:confirm={() => pendingConfirmAction?.()} />{/if}

<style>
  .security-subview { display: grid; gap: var(--ui-space-4); }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--ui-space-3); }
  .kpi-grid :global(.ui-card) { display: grid; gap: var(--ui-space-1); }
  .kpi-grid span, .freshness, .excluded-note, .muted, small { color: var(--ui-text-muted); font-size: var(--ui-type-label); }
  .kpi-grid strong { color: var(--ui-text-primary); font-size: clamp(1.4rem, 3vw, 2rem); }
  .excluded-note { margin: 0 0 0 auto; align-self: center; }
  .user-link { display: inline-flex; align-items: center; gap: var(--ui-space-2); padding: 0; border: 0; background: transparent; color: inherit; text-align: start; cursor: pointer; }
  .user-link > span:last-child { display: grid; gap: 0.15rem; }
  .user-link:focus-visible { outline: 2px solid var(--ui-accent-info); outline-offset: 3px; border-radius: var(--ui-radius-sm); }
  .avatar { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 999px; background: var(--ui-surface-tertiary); color: var(--ui-text-primary); font-weight: 700; }
  .muted { display: block; margin-top: 0.2rem; }
  .agent { max-width: 22rem; overflow-wrap: anywhere; }
  .actions-cell { display: flex; gap: var(--ui-space-2); min-width: 18rem; }
  .pagination-bar, .pagination-bar > div { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-2); }
  .pagination-bar { padding-top: var(--ui-space-3); }
  .pagination-bar p, .pagination-bar span { margin: 0; color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
  input { background-color: var(--ui-surface-input); color: var(--ui-text-primary); }
  @media (max-width: 760px) { .kpi-grid { grid-template-columns: 1fr; } .pagination-bar { align-items: stretch; flex-direction: column; } .excluded-note { margin-left: 0; } }
</style>
