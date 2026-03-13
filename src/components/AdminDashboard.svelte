<script>
  import Tabs from '../lib/components/ui/Tabs.svelte';
  import AdminStats from './admin/AdminStats.svelte';
  import UserTable from './admin/UserTable.svelte';
  import SessionManager from './admin/SessionManager.svelte';
  import StorageOverview from './admin/StorageOverview.svelte';
  import AuditLogViewer from './admin/AuditLogViewer.svelte';

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'users', label: 'Users' },
    { value: 'sessions', label: 'Sessions' },
    { value: 'storage', label: 'Storage' },
    { value: 'audit', label: 'Audit Logs' }
  ];

  let activeTab = 'overview';
  $: activeTabLabel = tabs.find((tab) => tab.value === activeTab)?.label ?? 'Overview';

  function handleTabChange(event) {
    activeTab = event.detail.value;
  }
</script>

<div class="admin-page">
  <header class="admin-header">
    <p class="eyebrow">Admin Console</p>
    <h1>Operations and Security</h1>
    <p class="subtitle">Monitor platform activity, manage users, and audit actions.</p>
  </header>

  <Tabs
    className="admin-tabs"
    ariaLabel="Admin sections"
    items={tabs}
    value={activeTab}
    variant="underline"
    mobileScrollable
    on:change={handleTabChange}
  />

  <div class="admin-content">
    {#if activeTab === 'overview'}
      <AdminStats />
    {:else if activeTab === 'users'}
      <UserTable />
    {:else if activeTab === 'sessions'}
      <SessionManager />
    {:else if activeTab === 'storage'}
      <StorageOverview />
    {:else if activeTab === 'audit'}
      <AuditLogViewer />
    {/if}
  </div>
</div>

<style>
  .admin-page {
    display: grid;
    gap: 1rem;
    min-width: 0;
  }

  .admin-header {
    display: grid;
    gap: 0.5rem;
    max-width: 44rem;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.67rem;
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.7rem, 3vw, 2.35rem);
    font-weight: 600;
    line-height: 1.06;
    letter-spacing: -0.03em;
    color: var(--color-text-primary);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.6;
    max-width: 58ch;
  }

  .admin-page :global(.admin-tabs) {
    width: 100%;
    max-width: 100%;
    border-bottom-color: color-mix(in srgb, var(--foreground) 8%, var(--border) 92%);
  }

  .admin-page :global(.admin-tabs .ui-tabs__tab) {
    min-width: 112px;
    padding: 0.75rem 1rem;
  }

  .admin-content {
    min-width: 0;
  }

  @media (min-width: 720px) {
    .admin-page :global(.admin-tabs .ui-tabs__tab) {
      flex: 1 1 0;
    }
  }

  @media (max-width: 640px) {
    .admin-page {
      gap: 0.875rem;
    }

    .admin-page :global(.admin-tabs .ui-tabs__tab) {
      min-width: max-content;
      padding-inline: 0.9rem;
    }
  }
</style>
