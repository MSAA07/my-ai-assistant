<script>
  import Badge from '../lib/components/ui/Badge.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import MetaPill from '../lib/components/ui/MetaPill.svelte';
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
  <Card as="header" class="admin-hero" variant="base" padding="lg" border="strong">
    <div class="admin-hero-copy">
      <p class="eyebrow">Admin Console</p>
      <h1>Operations and Security</h1>
      <p class="subtitle">Monitor platform activity, manage users, and audit actions.</p>
    </div>

    <div class="admin-hero-meta">
      <MetaPill label="Workspace">
        <Badge tone="destructive" variant="soft" size="sm">Restricted</Badge>
      </MetaPill>
      <MetaPill label="Current View">
        <Badge tone="neutral" variant="outline" size="sm">{activeTabLabel}</Badge>
      </MetaPill>
    </div>
  </Card>

  <Card class="admin-nav" variant="base" padding="md" border="strong">
    <div class="header-copy">
      <p class="eyebrow">Admin Console</p>
      <h2>Console Sections</h2>
      <p class="subtitle">Switch between analytics, user operations, sessions, storage, and audit activity.</p>
    </div>

    <Tabs
      className="admin-tabs"
      ariaLabel="Admin sections"
      items={tabs}
      value={activeTab}
      variant="underline"
      mobileScrollable
      on:change={handleTabChange}
    />
  </Card>

  <div class="admin-stage">
    <div class="admin-stage-head">
      <div>
        <p class="stage-eyebrow">Current View</p>
        <h2>{activeTabLabel}</h2>
      </div>
      <Badge tone="accent" variant="soft" size="sm">Live data</Badge>
    </div>

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
</div>

<style>
  .admin-page {
    display: grid;
    gap: 1.25rem;
    min-width: 0;
  }

  :global(.admin-hero) {
    display: grid;
    gap: 1.5rem;
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--foreground) 7%, transparent) 0%, transparent 46%),
      linear-gradient(180deg, color-mix(in srgb, var(--card) 92%, var(--muted) 8%) 0%, var(--card) 100%);
  }

  .admin-hero-copy {
    display: grid;
    gap: 0.5rem;
    max-width: 42rem;
  }

  .admin-hero-meta {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .header-copy {
    display: grid;
    gap: 0.35rem;
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

  h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--foreground);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.6;
    max-width: 72ch;
  }

  .stage-eyebrow {
    color: var(--muted-foreground);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :global(.admin-nav) {
    display: grid;
    gap: 1rem;
  }

  :global(.admin-tabs) {
    width: 100%;
    max-width: 100%;
  }

  .admin-stage {
    display: grid;
    gap: 0.9rem;
    min-width: 0;
  }

  .admin-stage-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .admin-content {
    min-width: 0;
  }

  @media (max-width: 640px) {
    :global(.admin-tabs) {
      width: 100%;
    }

    .admin-stage-head {
      align-items: stretch;
    }
  }
</style>
