<script>
  import Tabs from '../../lib/components/ui/Tabs.svelte';
  import { router } from '../../stores/router.js';
  import SessionManager from './SessionManager.svelte';
  import AuditLogViewer from './AuditLogViewer.svelte';
  import { buildSecurityAccessPath } from '../../lib/admin/securityAccess.js';

  export let initialView = 'sessions';
  export let userId = '';
  export let activity = 'all';

  const subviews = [{ value: 'sessions', label: 'Sessions' }, { value: 'audit', label: 'Audit Logs' }];
  let activeView = initialView === 'audit' ? 'audit' : 'sessions';

  function switchView(event) {
    activeView = event.detail.value;
    router.navigate(buildSecurityAccessPath(userId, { view: activeView, activity }), { replace: true });
  }
</script>

<section class="security-access" aria-labelledby="security-access-title">
  <header>
    <div>
      <p>Admin Console</p>
      <h2 id="security-access-title">Security &amp; Access</h2>
      <span>Review live access and the history of sensitive administrative changes.</span>
    </div>
    {#if userId}<span class="filter-chip">Filtered to user {userId}</span>{/if}
  </header>
  <Tabs items={subviews} value={activeView} ariaLabel="Security and access views" on:change={switchView} />
  {#if activeView === 'sessions'}
    <SessionManager {userId} />
  {:else}
    <AuditLogViewer {userId} initialActivity={activity} />
  {/if}
</section>

<style>
  .security-access { display: grid; gap: var(--ui-space-4); min-width: 0; }
  header { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--ui-space-3); }
  header > div { display: grid; gap: var(--ui-space-1); }
  header p, header h2, header span { margin: 0; }
  header p { color: var(--ui-text-muted); font-size: var(--ui-type-label); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  header h2 { color: var(--ui-text-primary); font-size: var(--ui-type-title-lg); }
  header span { color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
  .filter-chip { padding: var(--ui-space-2) var(--ui-space-3); border: 1px solid var(--ui-border-default); border-radius: 999px; background: var(--ui-surface-secondary); overflow-wrap: anywhere; }
  @media (max-width: 700px) { header { align-items: stretch; flex-direction: column; } }
</style>
