<script>
  import AdminStats from './admin/AdminStats.svelte';
  import UserTable from './admin/UserTable.svelte';
  import SessionManager from './admin/SessionManager.svelte';
  import StorageOverview from './admin/StorageOverview.svelte';
  import AuditLogViewer from './admin/AuditLogViewer.svelte';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'storage', label: 'Storage' },
    { id: 'audit', label: 'Audit Logs' }
  ];

  let activeTab = 'overview';
</script>

<div class="admin-shell">
  <header class="admin-header">
    <div>
      <p class="eyebrow">Admin Console</p>
      <h1>User Management & Security</h1>
      <p class="subtitle">Monitor platform activity, manage users, and audit actions.</p>
    </div>
  </header>

  <nav class="admin-tabs">
    {#each tabs as tab}
      <button
        class="tab"
        class:active={activeTab === tab.id}
        on:click={() => (activeTab = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <section class="admin-content">
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
  </section>
</div>

<style>
  .admin-shell {
    padding: 2rem;
    background: var(--color-surface);
    border-radius: 1.25rem;
    border: 1px solid var(--color-border);
  }

  .admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.7rem;
    color: var(--color-text-secondary);
    margin: 0 0 0.5rem;
  }

  .admin-header h1 {
    font-size: 2rem;
    margin: 0 0 0.5rem;
    color: var(--color-text);
  }

  .subtitle {
    color: var(--color-text-secondary);
    margin: 0;
  }

  .admin-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  .tab {
    padding: 0.6rem 1.2rem;
    border-radius: 999px;
    border: 1px solid transparent;
    background: rgba(96, 165, 250, 0.08);
    color: var(--color-text-secondary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab:hover {
    color: var(--color-text);
    border-color: rgba(96, 165, 250, 0.35);
  }

  .tab.active {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.25), rgba(139, 92, 246, 0.2));
    color: var(--color-text);
    border-color: rgba(96, 165, 250, 0.5);
  }

  .admin-content {
    display: grid;
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    .admin-shell {
      padding: 1.5rem;
    }

    .admin-header h1 {
      font-size: 1.6rem;
    }
  }
</style>
