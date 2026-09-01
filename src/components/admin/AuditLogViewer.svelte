<script>
  import { onDestroy, onMount } from 'svelte';
  import { ChevronDown, ChevronRight } from '@lucide/svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import SectionState from '../../lib/components/ui/SectionState.svelte';
  import Tabs from '../../lib/components/ui/Tabs.svelte';
  import { API_BASE } from '../../config.js';
  import { router } from '../../stores/router.js';
  import { buildAdminUserPath, buildAuditQuery, buildSecurityAccessPath } from '../../lib/admin/securityAccess.js';

  export let userId = '';
  export let initialActivity = 'all';

  const activityTabs = [{ value: 'all', label: 'All Activity' }, { value: 'admin', label: 'Admin Activity' }];
  let activity = initialActivity === 'admin' ? 'admin' : 'all';
  let logs = [];
  let actions = [];
  let loading = true;
  let refreshing = false;
  let error = '';
  let actionFilter = 'all';
  let from = '';
  let to = '';
  let userFilter = userId || '';
  let total = 0;
  let limit = 25;
  let offset = 0;
  let kpis = { actionsToday: 0, mostActiveAdmin: null };
  let expandedIds = [];
  let lastUpdatedAt = null;
  let clock = Date.now();
  let clockTimer;

  $: currentPage = Math.floor(offset / limit) + 1;
  $: totalPages = Math.max(1, Math.ceil(total / limit));
  $: pageStart = total === 0 ? 0 : offset + 1;
  $: pageEnd = Math.min(offset + logs.length, total);
  $: freshness = formatRelative(lastUpdatedAt, clock);

  function formatRelative(value, now) {
    if (!value) return 'Not updated yet';
    const seconds = Math.max(0, Math.floor((now - value) / 1000));
    if (seconds < 5) return 'Updated just now';
    if (seconds < 60) return `Updated ${seconds}s ago`;
    return `Updated ${Math.floor(seconds / 60)}m ago`;
  }
  function formatJson(value) { return value === null || value === undefined ? 'Not captured for this entry.' : JSON.stringify(value, null, 2); }

  async function fetchLogs({ background = false, resetPage = false } = {}) {
    if (resetPage) offset = 0;
    if (background) refreshing = true;
    else { loading = true; error = ''; }
    try {
      const query = buildAuditQuery({ limit, offset, action: actionFilter, from, to, userId: userFilter, activity });
      const response = await fetch(`${API_BASE}/api/admin/audit-logs?${query}`, { credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to fetch audit logs');
      logs = data.logs || [];
      actions = data.actions || [];
      total = Number(data.total || 0);
      limit = Number(data.limit || limit);
      offset = Number(data.offset || 0);
      kpis = data.kpis || { actionsToday: 0, mostActiveAdmin: null };
      expandedIds = expandedIds.filter((id) => logs.some((log) => log.id === id));
      lastUpdatedAt = Date.now();
      error = '';
    } catch (err) {
      error = err.message || 'Failed to load audit logs';
    } finally {
      loading = false;
      refreshing = false;
    }
  }

  function switchActivity(event) {
    activity = event.detail.value;
    router.navigate(buildSecurityAccessPath(userFilter, { view: 'audit', activity }), { replace: true });
    void fetchLogs({ resetPage: true });
  }
  function applyFilters() { void fetchLogs({ resetPage: true }); }
  function clearUserFilter() {
    userFilter = '';
    router.navigate(buildSecurityAccessPath('', { view: 'audit', activity }), { replace: true });
    void fetchLogs({ resetPage: true });
  }
  function changePage(nextPage) {
    offset = (Math.min(Math.max(nextPage, 1), totalPages) - 1) * limit;
    void fetchLogs({ background: true });
  }
  function toggleExpanded(id) { expandedIds = expandedIds.includes(id) ? expandedIds.filter((value) => value !== id) : [...expandedIds, id]; }
  function openActor(log) {
    if (activity === 'admin') {
      userFilter = log.adminId;
      router.navigate(buildSecurityAccessPath(log.adminId, { view: 'audit', activity: 'admin' }));
      void fetchLogs({ resetPage: true });
    } else router.navigate(buildAdminUserPath(log.adminId));
  }

  onMount(() => {
    void fetchLogs();
    clockTimer = window.setInterval(() => (clock = Date.now()), 1000);
  });
  onDestroy(() => { if (clockTimer) window.clearInterval(clockTimer); });
</script>

<section class="audit-subview" aria-labelledby="audit-heading">
  <Tabs items={activityTabs} value={activity} ariaLabel="Audit activity views" size="sm" on:change={switchActivity} />

  {#if activity === 'admin'}
    <div class="kpi-grid" aria-label="Admin activity metrics">
      <Card variant="base" border="subtle" padding="md"><span>Admin actions today</span><strong>{kpis.actionsToday || 0}</strong></Card>
      <Card variant="base" border="subtle" padding="md"><span>Most active admin today</span>{#if kpis.mostActiveAdmin}<button type="button" class="admin-kpi-link" on:click={() => { userFilter = kpis.mostActiveAdmin.id; router.navigate(buildSecurityAccessPath(kpis.mostActiveAdmin.id, { view: 'audit', activity: 'admin' })); fetchLogs({ resetPage: true }); }}><strong>{kpis.mostActiveAdmin.name || kpis.mostActiveAdmin.email || kpis.mostActiveAdmin.id}</strong><small>{kpis.mostActiveAdmin.actions} actions</small></button>{:else}<strong>—</strong>{/if}</Card>
    </div>
  {/if}

  <DataSurface title={activity === 'admin' ? 'Admin Activity' : 'All Activity'} description="What changed, who changed it, and the stored before/after values." tableMinWidth="1160px">
    <svelte:fragment slot="actions"><span class="freshness" aria-live="polite">{freshness}</span><Button type="button" variant="secondary" size="sm" disabled={loading || refreshing} on:click={() => fetchLogs({ background: logs.length > 0 })}>{refreshing ? 'Refreshing...' : 'Refresh'}</Button></svelte:fragment>
    <svelte:fragment slot="filters">
      <FieldShell className="filter-field" label="Action"><select bind:value={actionFilter} on:change={applyFilters}><option value="all">All actions</option>{#each actions as action}<option value={action}>{action.replaceAll('_', ' ')}</option>{/each}</select></FieldShell>
      <FieldShell className="filter-field" label="From"><input type="date" bind:value={from} on:change={applyFilters} /></FieldShell>
      <FieldShell className="filter-field" label="To"><input type="date" bind:value={to} on:change={applyFilters} /></FieldShell>
      <FieldShell className="filter-field" label="Actor or target user ID"><input placeholder="Filter user activity" bind:value={userFilter} on:change={applyFilters} /></FieldShell>
      {#if userFilter}<Button type="button" variant="ghost" size="sm" on:click={clearUserFilter}>Clear user filter</Button>{/if}
    </svelte:fragment>
    <svelte:fragment slot="state">
      {#if loading && logs.length === 0}<SectionState message="Loading audit activity..." />
      {:else if error}<SectionState message={error} error retry={() => fetchLogs()} />
      {:else if logs.length === 0}<SectionState message="No audit entries match these filters." />{/if}
    </svelte:fragment>
    <svelte:fragment slot="table">
      {#if !loading && !error && logs.length > 0}
        <table class="ui-data-table">
          <thead><tr><th><span class="sr-only">Details</span></th><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>IP address</th></tr></thead>
          <tbody>
            {#each logs as log (log.id)}
              <tr>
                <td><button type="button" class="expand-button" aria-label={`${expandedIds.includes(log.id) ? 'Collapse' : 'Expand'} details for ${log.action}`} aria-expanded={expandedIds.includes(log.id)} on:click={() => toggleExpanded(log.id)}>{#if expandedIds.includes(log.id)}<ChevronDown aria-hidden="true" />{:else}<ChevronRight aria-hidden="true" />{/if}</button></td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td><button type="button" class="identity-link" on:click={() => openActor(log)}><strong>{log.actor?.name || log.actor?.email || log.adminId}</strong>{#if log.actor?.email && log.actor?.name}<small>{log.actor.email}</small>{/if}</button></td>
                <td><Badge tone="neutral" size="xs" uppercase>{log.action.replaceAll('_', ' ')}</Badge></td>
                <td>{#if log.targetUser}<button type="button" class="identity-link" on:click={() => router.navigate(buildAdminUserPath(log.targetUser.id))}><strong>{log.targetUser.name || log.targetUser.email}</strong><small>{log.targetUser.email}</small></button>{:else}<span class="target-id">{log.targetId || '—'}</span>{/if}</td>
                <td>{log.ipAddress || '—'}</td>
              </tr>
              {#if expandedIds.includes(log.id)}
                <tr class="diff-row"><td colspan="6"><div class="diff-grid"><section><h3>Before</h3><pre>{formatJson(log.previousValue)}</pre></section><section><h3>After</h3><pre>{formatJson(log.newValue)}</pre></section><section><h3>Context</h3><pre>{formatJson(log.details)}</pre></section></div></td></tr>
              {/if}
            {/each}
          </tbody>
        </table>
        <div class="pagination-bar"><p>Showing {pageStart}-{pageEnd} of {total} entries</p><div><Button type="button" variant="secondary" size="sm" disabled={currentPage <= 1 || refreshing} on:click={() => changePage(currentPage - 1)}>Previous</Button><span>Page {currentPage} of {totalPages}</span><Button type="button" variant="secondary" size="sm" disabled={currentPage >= totalPages || refreshing} on:click={() => changePage(currentPage + 1)}>Next</Button></div></div>
      {/if}
    </svelte:fragment>
  </DataSurface>
</section>

<style>
  .audit-subview { display: grid; gap: var(--ui-space-4); }
  .kpi-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--ui-space-3); }
  .kpi-grid :global(.ui-card) { display: grid; gap: var(--ui-space-1); }
  .kpi-grid span, .freshness, small, .target-id { color: var(--ui-text-muted); font-size: var(--ui-type-label); }
  .kpi-grid strong { color: var(--ui-text-primary); font-size: clamp(1.35rem, 3vw, 1.85rem); }
  .admin-kpi-link, .identity-link { display: grid; gap: 0.15rem; padding: 0; border: 0; background: transparent; color: inherit; text-align: start; cursor: pointer; }
  .admin-kpi-link:focus-visible, .identity-link:focus-visible, .expand-button:focus-visible { outline: 2px solid var(--ui-accent-info); outline-offset: 3px; border-radius: var(--ui-radius-sm); }
  .expand-button { display: grid; place-items: center; width: 2rem; height: 2rem; padding: 0; border: 1px solid var(--ui-border-default); border-radius: var(--ui-radius-sm); background: var(--ui-surface-secondary); color: var(--ui-text-primary); cursor: pointer; }
  .expand-button :global(svg) { width: 1rem; height: 1rem; }
  .diff-row td { padding: 0 !important; background: var(--ui-surface-secondary); }
  .diff-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--ui-space-3); padding: var(--ui-space-4); }
  .diff-grid section { min-width: 0; }
  .diff-grid h3 { margin: 0 0 var(--ui-space-2); color: var(--ui-text-primary); font-size: var(--ui-type-body-sm); }
  pre { min-height: 5rem; margin: 0; padding: var(--ui-space-3); overflow: auto; border: 1px solid var(--ui-border-default); border-radius: var(--ui-radius-sm); background: var(--ui-surface-primary); color: var(--ui-text-secondary); font: 0.75rem/1.5 var(--font-family-mono); white-space: pre-wrap; overflow-wrap: anywhere; }
  select, option, input { background-color: var(--ui-surface-input); color: var(--ui-text-primary); }
  .pagination-bar, .pagination-bar > div { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-2); }
  .pagination-bar { padding-top: var(--ui-space-3); }
  .pagination-bar p, .pagination-bar span { margin: 0; color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  @media (max-width: 850px) { .diff-grid, .kpi-grid { grid-template-columns: 1fr; } .pagination-bar { align-items: stretch; flex-direction: column; } }
</style>
