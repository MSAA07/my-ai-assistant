<script>
  import { onMount, createEventDispatcher } from 'svelte';

  export let userId;

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
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

  onMount(fetchUser);
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
  <div class="modal" on:click|stopPropagation>
    <header>
      <div>
        <h2>User Detail</h2>
        <p class="muted">Manage account, files, and sessions.</p>
      </div>
      <button class="close" on:click={() => dispatch('close')}>Close</button>
    </header>

    {#if loading}
      <p class="muted">Loading...</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else}
      <div class="tab-row">
        <button class:active={activeTab === 'profile'} on:click={() => (activeTab = 'profile')}>Profile</button>
        <button class:active={activeTab === 'files'} on:click={() => (activeTab = 'files')}>Files</button>
        <button class:active={activeTab === 'sessions'} on:click={() => (activeTab = 'sessions')}>Sessions</button>
      </div>

      {#if activeTab === 'profile'}
        <div class="profile-grid">
          <div class="card">
            <h3>Account</h3>
            <div class="field">
              <label>Name</label>
              <input bind:value={form.name} />
            </div>
            <div class="field">
              <label>Plan</label>
              <select bind:value={form.plan}>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div class="field">
              <label>Monthly Limit</label>
              <input type="number" bind:value={form.monthlyLimit} />
            </div>
            <div class="field">
              <label>Role</label>
              <select bind:value={form.role}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="actions">
              <button class="primary" on:click={updateUser}>Save Changes</button>
              <button class="secondary" on:click={toggleBan}>{user.banned ? 'Unban' : 'Ban'} User</button>
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
                  <button class="danger" on:click={() => deleteDocument(doc.id)}>Delete</button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {:else}
        <div class="card">
          <header class="card-header">
            <h3>Sessions</h3>
            <button class="secondary" on:click={revokeAllSessions}>Revoke All</button>
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
                  <button class="danger" on:click={() => revokeSession(session.id)}>Revoke</button>
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
    background: rgba(10, 14, 39, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
  }

  .modal {
    background: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 1rem;
    padding: 1.5rem;
    width: min(900px, 100%);
    max-height: 90vh;
    overflow-y: auto;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .close {
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: transparent;
    color: var(--color-text);
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    cursor: pointer;
  }

  .tab-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tab-row button {
    padding: 0.45rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
  }

  .tab-row button.active {
    background: rgba(96, 165, 250, 0.2);
    color: var(--color-text);
  }

  .profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .card {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.9rem;
    padding: 1rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .field {
    display: grid;
    gap: 0.4rem;
    margin-bottom: 0.8rem;
  }

  input,
  select {
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 0.6rem;
    padding: 0.5rem 0.8rem;
    color: var(--color-text);
  }

  .actions {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .primary {
    background: linear-gradient(135deg, #60a5fa, #818cf8);
    border: none;
    color: #0f172a;
    font-weight: 600;
    border-radius: 0.6rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .secondary {
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: transparent;
    color: var(--color-text);
    border-radius: 0.6rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.6rem;
  }

  .list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0.8rem;
    border-radius: 0.6rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .danger {
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #fca5a5;
    background: transparent;
    border-radius: 0.6rem;
    padding: 0.35rem 0.8rem;
    cursor: pointer;
  }

  .muted {
    color: var(--color-text-secondary);
  }

  .error {
    color: #fca5a5;
  }
</style>
