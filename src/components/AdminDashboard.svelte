<script>
  import PageLayout from '../lib/components/layout/PageLayout.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Tabs from '../lib/components/ui/Tabs.svelte';
  import AdminStats from './admin/AdminStats.svelte';
  import UserTable from './admin/UserTable.svelte';
  import SessionManager from './admin/SessionManager.svelte';
  import StorageOverview from './admin/StorageOverview.svelte';
  import AuditLogViewer from './admin/AuditLogViewer.svelte';
  import AdminJobs from './admin/AdminJobs.svelte';
  import AdminUsageDashboard from './admin/AdminUsageDashboard.svelte';
  import AdminLimits from './admin/AdminLimits.svelte';
  import AdminQA from './admin/AdminQA.svelte';
  import { t } from '../lib/i18n/t.js';
  import { language } from '../lib/stores/language.js';

  $: $language;
  $: tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'users', label: 'Users' },
    { value: 'usage', label: 'Usage' },
    { value: 'limits', label: 'Limits' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'qa', label: t('adminQA.tab') },
    { value: 'sessions', label: 'Sessions' },
    { value: 'storage', label: 'Storage' },
    { value: 'audit', label: 'Audit Logs' }
  ];

  let activeTab = 'overview';

  function handleTabChange(event) {
    activeTab = event.detail.value;
  }
</script>

<PageLayout class="admin-page" width="full" gap="spacious">
  <PageHeader
    eyebrow="Admin Console"
    title="User Management & Security"
    subtitle="Monitor platform activity, manage users, and audit actions."
    className="admin-header"
  />

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
    {:else if activeTab === 'usage'}
      <AdminUsageDashboard />
    {:else if activeTab === 'limits'}
      <AdminLimits />
    {:else if activeTab === 'jobs'}
      <AdminJobs />
    {:else if activeTab === 'qa'}
      <AdminQA />
    {:else if activeTab === 'sessions'}
      <SessionManager />
    {:else if activeTab === 'storage'}
      <StorageOverview />
    {:else if activeTab === 'audit'}
      <AuditLogViewer />
    {/if}
  </div>
</PageLayout>

<style>
  :global(.admin-page) {
    display: grid;
    gap: var(--study-flow-page-gap);
    min-width: 0;
  }

  :global(.admin-header) {
    max-width: 44rem;
  }

  :global(.admin-page .admin-tabs) {
    width: fit-content;
    max-width: 100%;
    gap: 1.5rem;
    border-bottom-color: color-mix(in srgb, var(--foreground) 8%, var(--border) 92%);
  }

  :global(.admin-page .admin-tabs .ui-tabs__tab) {
    min-width: 0;
    justify-content: flex-start;
    padding: 0 0 0.875rem;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .admin-content {
    min-width: 0;
  }

  @media (max-width: 640px) {
    :global(.admin-page) {
      gap: 1.25rem;
    }

    :global(.admin-page .admin-tabs .ui-tabs__tab) {
      min-width: max-content;
      padding-bottom: 0.8rem;
      font-size: 0.9rem;
    }
  }
</style>
