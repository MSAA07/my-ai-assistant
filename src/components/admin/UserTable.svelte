<script>
  import { onMount } from 'svelte';
  import UserDetail from './UserDetail.svelte';

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  let users = [];
  let loading = true;
  let error = '';
  let search = '';
  let roleFilter = 'all';
  let statusFilter = 'all';
  let planFilter = 'all';
  let selectedUserId = null;
  let searchTimeout = null;
  let selectedUserIds = [];

  let newUser = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    plan: 'free',
    monthlyLimit: ''
  };

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0);
    if (!value) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const size = value / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (planFilter !== 'all') params.set('plan', planFilter);
    return params.toString();
  };

  async function fetchUsers() {
    loading = true;
    error = '';

    try {
      const query = buildQuery();
      const response = await fetch(`${API_BASE}/api/admin/users${query ? `?${query}` : ''}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      users = data.users || [];
      selectedUserIds = selectedUserIds.filter((id) => users.some((user) => user.id === id));
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function toggleBan(user) {
    const endpoint = user.banned
      ? `/api/admin/users/${user.id}/unsuspend`
      : `/api/admin/users/${user.id}/suspend`;

    await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Admin action' })
    });

    await fetchUsers();
  }

  async function toggleRole(user) {
    const role = user.role === 'admin' ? 'user' : 'admin';
    await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    await fetchUsers();
  }

  async function deleteUser(user) {
    if (!confirm(`Delete ${user.email}? This removes all data.`)) return;
    await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await fetchUsers();
  }

  async function bulkSuspend() {
    if (!selectedUserIds.length) return;
    if (!confirm(`Suspend ${selectedUserIds.length} users?`)) return;

    const targets = users.filter((user) => selectedUserIds.includes(user.id));
    await Promise.all(
      targets
        .filter((user) => !user.banned)
        .map((user) =>
          fetch(`${API_BASE}/api/admin/users/${user.id}/suspend`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Bulk admin action' })
          })
        )
    );

    selectedUserIds = [];
    await fetchUsers();
  }

  async function bulkDelete() {
    if (!selectedUserIds.length) return;
    if (!confirm(`Delete ${selectedUserIds.length} users? This is irreversible.`)) return;

    await Promise.all(
      selectedUserIds.map((id) =>
        fetch(`${API_BASE}/api/admin/users/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      )
    );

    selectedUserIds = [];
    await fetchUsers();
  }

  async function createUser() {
    if (!newUser.email.trim() || !newUser.name.trim()) {
      error = 'Name and email are required.';
      return;
    }

    const payload = {
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      password: newUser.password || undefined,
      role: newUser.role,
      plan: newUser.plan,
      monthlyLimit: newUser.monthlyLimit ? Number(newUser.monthlyLimit) : undefined
    };

    const response = await fetch(`${API_BASE}/api/admin/users`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      error = data.error || 'Failed to create user';
      return;
    }

    newUser = { name: '', email: '', password: '', role: 'user', plan: 'free', monthlyLimit: '' };
    error = '';
    await fetchUsers();
  }

  function handleSearchInput() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchUsers, 400);
  }

  onMount(fetchUsers);
</script>

<section class="user-panel">
  <header class="panel-header">
    <div>
      <h2>Users</h2>
      <p class="muted">Search, filter, and manage accounts.</p>
    </div>
    <button class="refresh" on:click={fetchUsers}>Refresh</button>
  </header>

  <div class="filters">
    <input
      type="search"
      placeholder="Search name or email"
      bind:value={search}
      on:input={handleSearchInput}
    />
    <select bind:value={roleFilter} on:change={fetchUsers}>
      <option value="all">All roles</option>
      <option value="admin">Admin</option>
      <option value="user">User</option>
    </select>
    <select bind:value={statusFilter} on:change={fetchUsers}>
      <option value="all">All status</option>
      <option value="active">Active</option>
      <option value="banned">Banned</option>
    </select>
    <select bind:value={planFilter} on:change={fetchUsers}>
      <option value="all">All plans</option>
      <option value="free">Free</option>
      <option value="premium">Premium</option>
    </select>
  </div>

  <div class="create-user">
    <h3>Create User</h3>
    <div class="form-grid">
      <input placeholder="Full name" bind:value={newUser.name} />
      <input placeholder="Email" bind:value={newUser.email} />
      <input placeholder="Password (optional)" type="password" bind:value={newUser.password} />
      <select bind:value={newUser.role}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <select bind:value={newUser.plan}>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
      </select>
      <input placeholder="Monthly limit" type="number" bind:value={newUser.monthlyLimit} />
      <button class="primary" on:click={createUser}>Create</button>
    </div>
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#if loading}
    <p class="muted">Loading users...</p>
  {:else}
    <div class="bulk-actions">
      <span>{selectedUserIds.length} selected</span>
      <button on:click={bulkSuspend} disabled={!selectedUserIds.length}>Suspend Selected</button>
      <button class="danger" on:click={bulkDelete} disabled={!selectedUserIds.length}>Delete Selected</button>
    </div>
    {#if users.length === 0}
      <p class="muted">No users match your filters.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUserIds.length === users.length && users.length > 0}
                  on:change={() => {
                    selectedUserIds = selectedUserIds.length === users.length
                      ? []
                      : users.map((user) => user.id);
                  }}
                />
              </th>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Docs</th>
              <th>Storage</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user}
              <tr>
                <td>
                  <input type="checkbox" value={user.id} bind:group={selectedUserIds} />
                </td>
                <td>
                  <strong>{user.name}</strong>
                  <span class="muted">{user.email}</span>
                </td>
                <td>{user.role || 'user'}</td>
                <td>
                  <span class:user-banned={user.banned}>{user.banned ? 'Banned' : 'Active'}</span>
                </td>
                <td>{user.plan || 'free'}</td>
                <td>{user.documentCount}</td>
                <td>{formatBytes(user.storageUsed)}</td>
                <td>{user.lastActive ? new Date(user.lastActive).toLocaleString() : '-'}</td>
                <td class="actions">
                  <button on:click={() => (selectedUserId = user.id)}>View</button>
                  <button on:click={() => toggleBan(user)}>{user.banned ? 'Unban' : 'Ban'}</button>
                  <button on:click={() => toggleRole(user)}>
                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  <button class="danger" on:click={() => deleteUser(user)}>Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</section>

{#if selectedUserId}
  <UserDetail
    userId={selectedUserId}
    on:close={() => (selectedUserId = null)}
    on:updated={fetchUsers}
  />
{/if}

<style>
  .user-panel {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.2);
    padding: 1.5rem;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  h2 {
    margin: 0;
  }

  .muted {
    color: var(--color-text-secondary);
    display: block;
    font-size: 0.85rem;
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .filters input,
  .filters select,
  .form-grid input,
  .form-grid select {
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 0.6rem;
    padding: 0.6rem 0.8rem;
    color: var(--color-text);
  }

  .create-user {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.8rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
    margin-top: 0.75rem;
    align-items: center;
  }

  .primary {
    background: linear-gradient(135deg, #60a5fa, #818cf8);
    border: none;
    color: #0f172a;
    font-weight: 600;
    border-radius: 0.6rem;
    padding: 0.6rem 1rem;
    cursor: pointer;
  }

  .refresh {
    padding: 0.45rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.4);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .bulk-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  .bulk-actions button {
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
  }

  .bulk-actions .danger {
    border-color: rgba(239, 68, 68, 0.5);
    color: #fca5a5;
  }

  .bulk-actions button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    text-align: left;
    vertical-align: top;
  }

  th {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .actions button {
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
  }

  .actions .danger {
    border-color: rgba(239, 68, 68, 0.5);
    color: #fca5a5;
  }

  .user-banned {
    color: #f87171;
  }

  .error {
    color: #fca5a5;
  }

  @media (max-width: 768px) {
    .panel-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .actions {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
