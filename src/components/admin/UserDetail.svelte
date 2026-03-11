<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { API_BASE } from "../../config.js";

  export let userId;

  const dispatch = createEventDispatcher();

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
    const monthlyLimitValue = form.monthlyLimit === '' || form.monthlyLimit === null
      ? undefined
      : Number(form.monthlyLimit);

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

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      dispatch('close');
    }
  };

  const handleBackdropKeydown = (event) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      dispatch('close');
    }
  };

  onMount(fetchUser);
</script>

<div
  class="modal-backdrop"
  role="button"
  aria-label="Close user detail"
  tabindex="0"
  on:click={handleBackdropClick}
  on:keydown={handleBackdropKeydown}
>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="user-detail-heading"
  >
    <header>
      <div>
        <h2 id="user-detail-heading">User Detail</h2>
        <p class="muted">Manage account, files, and sessions.</p>
      </div>
      <button class="close" type="button" on:click={() => dispatch('close')}>
        Close
      </button>
    </header>

    {#if loading}
      <p class="muted">Loading...</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else}
      <div class="tab-row" role="tablist" aria-label="User detail sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          class:active={activeTab === 'profile'}
          on:click={() => (activeTab = 'profile')}
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'files'}
          class:active={activeTab === 'files'}
          on:click={() => (activeTab = 'files')}
        >
          Files
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sessions'}
          class:active={activeTab === 'sessions'}
          on:click={() => (activeTab = 'sessions')}
        >
          Sessions
        </button>
      </div>

      {#if activeTab === 'profile'}
        <div class="profile-grid">
          <div class="card">
            <h3>Account</h3>
            <div class="field">
              <label for="account-name">Name</label>
              <input id="account-name" name="name" bind:value={form.name} />
            </div>
            <div class="field">
              <label for="account-plan">Plan</label>
              <select id="account-plan" name="plan" bind:value={form.plan}>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div class="field">
              <label for="account-monthly-limit">Monthly Limit</label>
              <input id="account-monthly-limit" name="monthlyLimit" type="number" bind:value={form.monthlyLimit} />
            </div>
            <div class="field">
              <label for="account-role">Role</label>
              <select id="account-role" name="role" bind:value={form.role}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="actions">
              <button class="primary" type="button" on:click={updateUser}>Save Changes</button>
              <button class="secondary" type="button" on:click={toggleBan}>
                {user.banned ? 'Unban' : 'Ban'} User
              </button>
            </div>
          </div>

          <div class="card">
            <h3>Stats</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Documents:</strong> {stats?.documents ?? 0}</p>
            <p><strong>Storage:</strong> {formatBytes(user.storageUsed)}</p>
            <p><strong>Sessions:</strong> {stats?.sessions ?? 0}</p>
            <p><strong>Exam Attempts:</strong> {stats?.examAttempts ?? 0}</p>
            <p><strong>Flashcard Progress:</strong> {stats?.flashcardProgress ?? 0}</p>
            <p><strong>Last Active:</strong> {user.lastActive ? new Date(user.lastActive).toLocaleString() : '-'}</p>
          </div>
        </div>
      {:else if activeTab === 'files'}
        <div class="card">
          <h3>User Files</h3>
          {#if documents.length === 0}
            <p class="muted">No documents uploaded.</p>
          {:else}
            <ul class="list">
              {#each documents as doc}
                <li>
                  <div>
                    <strong>{doc.originalName}</strong>
                    <span class="muted">{formatBytes(doc.fileSize)} - {new Date(doc.uploadDate).toLocaleDateString()}</span>
                  </div>
                  <button class="danger" type="button" on:click={() => deleteDocument(doc.id)}>Delete</button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {:else}
        <div class="card">
          <header class="card-header">
            <h3>Sessions</h3>
            <button class="secondary" type="button" on:click={revokeAllSessions}>Revoke All</button>
          </header>
          {#if sessions.length === 0}
            <p class="muted">No active sessions.</p>
          {:else}
            <ul class="list">
              {#each sessions as session}
                <li>
                  <div>
                    <strong>{session.ipAddress || 'Unknown IP'}</strong>
                    <span class="muted">
                      Expires {new Date(session.expiresAt).toLocaleString()}
                      {session.userAgent ? ` - ${session.userAgent}` : ''}
                    </span>
                  </div>
                  <button class="danger" type="button" on:click={() => revokeSession(session.id)}>Revoke</button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: var(--color-backdrop-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: var(--space-4);
  }

  .modal {
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: var(--space-5);
    width: min(900px, 100%);
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-modal-strong);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
  }

  .close {
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-primary);
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .close:hover,
  .close:focus-visible {
    background: var(--color-surface-2);
    border-color: var(--color-accent-primary);
    color: var(--color-text-primary);
    outline: none;
  }

  .tab-row {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .tab-row button {
    padding: 0.45rem 1rem;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }

  .tab-row button.active {
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    border-color: var(--color-accent-primary);
  }

  .profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-4);
  }

  .card {
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: var(--space-4);
    display: grid;
    gap: var(--space-3);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .field {
    display: grid;
    gap: var(--space-2);
  }

  input,
  select {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    padding: 0.5rem 0.8rem;
    color: var(--color-text-primary);
    transition: border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  input:focus-visible,
  select:focus-visible {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent-primary) 30%, transparent);
  }

  .actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .primary {
    background: var(--color-accent-primary);
    border: none;
    color: var(--color-bg);
    font-weight: 600;
    border-radius: var(--radius-1);
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard);
  }

  .primary:hover,
  .primary:focus-visible {
    background: color-mix(in srgb, var(--color-accent-primary) 85%, white 15%);
    outline: none;
  }

  .secondary {
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-primary);
    border-radius: var(--radius-1);
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }

  .secondary:hover,
  .secondary:focus-visible {
    background: var(--color-surface-2);
    border-color: var(--color-accent-primary);
    outline: none;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--space-2);
  }

  .list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 0.6rem 0.8rem;
    border-radius: var(--radius-1);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
  }

  .danger {
    border: 1px solid color-mix(in srgb, var(--color-danger) 40%, transparent);
    color: var(--color-danger);
    background: transparent;
    border-radius: var(--radius-1);
    padding: 0.35rem 0.8rem;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .danger:hover,
  .danger:focus-visible {
    background: color-mix(in srgb, var(--color-danger) 18%, transparent);
    color: color-mix(in srgb, var(--color-danger) 80%, var(--color-text-soft) 20%);
    outline: none;
  }

  .muted {
    color: var(--color-text-muted);
  }

  .error {
    color: var(--color-danger);
  }
</style>
