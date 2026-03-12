<script>
  import Card from '../lib/components/ui/Card.svelte';
  import Section from '../lib/components/ui/Section.svelte';
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

  function handleTabChange(event) {
    activeTab = event.detail.value;
  }
</script>

<Section className="admin-shell">
  <div slot="header" class="header-copy">
    <p class="eyebrow">Admin Console</p>
    <h1>User Management & Security</h1>
    <p class="subtitle">Monitor platform activity, manage users, and audit actions.</p>
  </div>

  <Tabs
    className="admin-tabs"
    ariaLabel="Admin sections"
    items={tabs}
    value={activeTab}
    mobileScrollable
    on:change={handleTabChange}
  />

  <Card class="admin-content" variant="soft" border="none" padding="none">
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
  </Card>
</Section>

<style>
  :global(.admin-shell) {
    gap: var(--space-4);
  }

  .header-copy {
    display: grid;
    gap: 0.25rem;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-weight: 700;
  }

  h1 {
    margin: 0;
    font-size: 1.7rem;
    color: var(--color-text-primary);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  :global(.admin-tabs) {
    width: fit-content;
    max-width: 100%;
  }

  :global(.admin-content) {
    box-shadow: none;
    background: transparent;
  }

  @media (max-width: 640px) {
    :global(.admin-tabs) {
      width: 100%;
    }

    h1 {
      font-size: 1.4rem;
    }
  }
</style>
