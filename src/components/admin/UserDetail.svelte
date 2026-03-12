<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import ModalSurface from '../../lib/components/ui/ModalSurface.svelte';
  import Tabs from '../../lib/components/ui/Tabs.svelte';
  import { API_BASE } from '../../config.js';

  export let userId;

  const dispatch = createEventDispatcher();

  const tabItems = [
    { value: 'profile', label: 'Profile' },
    { value: 'files', label: 'Files' },
    { value: 'sessions', label: 'Sessions' }
  ];

  let user = null;
  let stats = null;
  let documents = [];
  let sessions = [];
  let loading = true;
  let error = '';
  let activeTab = 'profile';

  let form = {
    name: '',
    plan: 'free',
    monthlyLimit: '',
    role: 'user'
  };

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0);
    if (!value) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const size = value / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  async function fetchUser() {
    loading = true;
    error = '';

    try {
      const [userRes, fileRes, sessionRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users/${userId}`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/users/${userId}/files`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/users/${userId}/sessions`, { credentials: 'include' })
      ]);

      const userData = await userRes.json();
      const fileData = await fileRes.json();
      const sessionData = await sessionRes.json();

      if (!userRes.ok) throw new Error(userData.error || 'Failed to fetch user');
      if (!fileRes.ok) throw new Error(fileData.error || 'Failed to fetch files');
      if (!sessionRes.ok) throw new Error(sessionData.error || 'Failed to fetch sessions');

      user = userData.user;
      stats = userData.stats;
      documents = fileData.documents || [];
      sessions = sessionData.sessions || [];

      form = {
        name: user.name,
        plan: user.plan,
        monthlyLimit: user.monthlyLimit,
        role: user.role || 'user'
      };
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function updateUser() {
    const monthlyLimitValue =
      form.monthlyLimit === '' || form.monthlyLimit === null ? undefined : Number(form.monthlyLimit);

    const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        plan: form.plan,
        monthlyLimit: monthlyLimitValue,
        role: form.role
      })
    });

    const data = await response.json();
    if (!response.ok) {
      error = data.error || 'Failed to update user';
      return;
    }

    user = data.user;
    await fetchUser();
    dispatch('updated');
  }

  async function toggleBan() {
    const endpoint = user.banned
      ? `/api/admin/users/${userId}/unsuspend`
      : `/api/admin/users/${userId}/suspend`;

    await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Admin action' })
    });

    await fetchUser();
    dispatch('updated');
  }

  async function deleteDocument(documentId) {
    if (!confirm('Delete this document?')) return;
    await fetch(`${API_BASE}/api/admin/users/${userId}/files/${documentId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await fetchUser();
    dispatch('updated');
  }

  async function revokeSession(sessionId) {
    await fetch(`${API_BASE}/api/admin/users/${userId}/sessions/${sessionId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await fetchUser();
    dispatch('updated');
  }

  async function revokeAllSessions() {
    if (!confirm('Revoke all sessions for this user?')) return;
    await fetch(`${API_BASE}/api/admin/users/${userId}/sessions`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await fetchUser();
    dispatch('updated');
  }

  function handleTabChange(event) {
    activeTab = event.detail.value;
  }

  onMount(fetchUser);
</script>

<ModalSurface
  open
  width="min(980px, 100%)"
  labelledBy="user-detail-heading"
  className="user-detail-modal"
  on:close={() => dispatch('close')}
>
  <header class="modal-header">
    <div>
      <h2 id="user-detail-heading">User Detail</h2>
      <p class="muted">Manage account, files, and sessions.</p>
    </div>
    <Button type="button" variant="ghost" size="sm" on:click={() => dispatch('close')}>Close</Button>
  </header>

  {#if loading}
    <p class="muted">Loading...</p>
  {:else if error}
    <Card class="error-card" variant="soft" border="strong" padding="sm">{error}</Card>
  {:else}
    <Tabs items={tabItems} value={activeTab} ariaLabel="User detail sections" on:change={handleTabChange} />

    {#if activeTab === 'profile'}
      <div class="profile-grid">
        <Card class="detail-card" variant="soft" padding="md">
          <h3>Account</h3>
          <div class="field-grid">
            <FieldShell label="Name" forId="account-name">
              <input id="account-name" name="name" bind:value={form.name} />
            </FieldShell>
            <FieldShell label="Plan" forId="account-plan">
              <select id="account-plan" name="plan" bind:value={form.plan}>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </FieldShell>
            <FieldShell label="Monthly Limit" forId="account-monthly-limit">
              <input id="account-monthly-limit" name="monthlyLimit" type="number" bind:value={form.monthlyLimit} />
            </FieldShell>
            <FieldShell label="Role" forId="account-role">
              <select id="account-role" name="role" bind:value={form.role}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </FieldShell>
          </div>

          <div class="actions">
            <Button type="button" variant="primary" size="sm" on:click={updateUser}>Save Changes</Button>
            <Button type="button" variant={user.banned ? 'success' : 'danger'} size="sm" on:click={toggleBan}>
              {user.banned ? 'Unban User' : 'Ban User'}
            </Button>
          </div>
        </Card>

        <Card class="detail-card" variant="soft" padding="md">
          <header class="stats-header">
            <h3>Stats</h3>
            <Badge tone={user.banned ? 'danger' : 'success'} size="sm">
              {user.banned ? 'Banned' : 'Active'}
            </Badge>
          </header>
          <dl class="stats-list">
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Documents</dt><dd>{stats?.documents ?? 0}</dd></div>
            <div><dt>Storage</dt><dd>{formatBytes(user.storageUsed)}</dd></div>
            <div><dt>Sessions</dt><dd>{stats?.sessions ?? 0}</dd></div>
            <div><dt>Exam Attempts</dt><dd>{stats?.examAttempts ?? 0}</dd></div>
            <div><dt>Flashcard Progress</dt><dd>{stats?.flashcardProgress ?? 0}</dd></div>
            <div>
              <dt>Last Active</dt>
              <dd>{user.lastActive ? new Date(user.lastActive).toLocaleString() : '-'}</dd>
            </div>
          </dl>
        </Card>
      </div>
    {:else if activeTab === 'files'}
      <Card class="detail-card" variant="soft" padding="md">
        <header class="card-header">
          <h3>User Files</h3>
          <Badge tone="neutral" size="sm">{documents.length} total</Badge>
        </header>

        {#if documents.length === 0}
          <p class="muted">No documents uploaded.</p>
        {:else}
          <ul class="item-list">
            {#each documents as doc}
              <li>
                <div>
                  <strong>{doc.originalName}</strong>
                  <span class="muted">{formatBytes(doc.fileSize)} - {new Date(doc.uploadDate).toLocaleDateString()}</span>
                </div>
                <Button type="button" variant="danger" size="sm" on:click={() => deleteDocument(doc.id)}>
                  Delete
                </Button>
              </li>
            {/each}
          </ul>
        {/if}
      </Card>
    {:else}
      <Card class="detail-card" variant="soft" padding="md">
        <header class="card-header">
          <h3>Sessions</h3>
          <Button type="button" variant="danger" size="sm" disabled={sessions.length === 0} on:click={revokeAllSessions}>
            Revoke All
          </Button>
        </header>

        {#if sessions.length === 0}
          <p class="muted">No active sessions.</p>
        {:else}
          <ul class="item-list">
            {#each sessions as session}
              <li>
                <div>
                  <strong>{session.ipAddress || 'Unknown IP'}</strong>
                  <span class="muted">
                    Expires {new Date(session.expiresAt).toLocaleString()}
                    {session.userAgent ? ` - ${session.userAgent}` : ''}
                  </span>
                </div>
                <Button type="button" variant="danger" size="sm" on:click={() => revokeSession(session.id)}>
                  Revoke
                </Button>
              </li>
            {/each}
          </ul>
        {/if}
      </Card>
    {/if}
  {/if}
</ModalSurface>

<style>
  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  h2,
  h3 {
    margin: 0;
    color: var(--color-text-primary);
  }

  .muted {
    margin: 0.28rem 0 0;
    color: var(--color-text-secondary);
    display: block;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-3);
  }

  :global(.detail-card) {
    gap: var(--space-3);
  }

  .field-grid {
    display: grid;
    gap: var(--space-3);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .stats-list {
    margin: 0;
    display: grid;
    gap: var(--space-2);
  }

  .stats-list div {
    display: grid;
    gap: 0.12rem;
  }

  .stats-list dt {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .stats-list dd {
    margin: 0;
    color: var(--color-text-primary);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .item-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-2);
  }

  .item-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-raised) 84%, transparent);
    padding: 0.65rem 0.75rem;
  }

  :global(.error-card) {
    color: var(--color-danger-soft);
    border-color: color-mix(in srgb, var(--color-danger) 34%, var(--color-border) 66%);
  }

  @media (max-width: 640px) {
    .item-list li {
      align-items: flex-start;
      flex-direction: column;
    }

    .item-list li :global(.ui-button) {
      width: 100%;
    }
  }
</style>
