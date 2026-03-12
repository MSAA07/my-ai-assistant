<script>
  import { onDestroy, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import UserDetail from './UserDetail.svelte';
  import { API_BASE } from '../../config.js';

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

  function toggleSelectAll() {
    selectedUserIds = selectedUserIds.length === users.length ? [] : users.map((user) => user.id);
  }

  $: allSelected = selectedUserIds.length === users.length && users.length > 0;

  onMount(fetchUsers);

  onDestroy(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
  });
</script>

<Card class="user-panel" variant="base" padding="md">
  <header class="panel-header">
    <div>
      <h2>Users</h2>
      <p class="muted">Search, filter, and manage accounts.</p>
    </div>
    <Button type="button" variant="secondary" size="sm" on:click={fetchUsers}>Refresh</Button>
  </header>

  <div class="filters">
    <FieldShell className="filter-field" label="Search">
      <input
        type="search"
        placeholder="Search name or email"
        bind:value={search}
        on:input={handleSearchInput}
      />
    </FieldShell>

    <FieldShell className="filter-field" label="Role">
      <select bind:value={roleFilter} on:change={fetchUsers}>
        <option value="all">All roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label="Status">
      <select bind:value={statusFilter} on:change={fetchUsers}>
        <option value="all">All status</option>
        <option value="active">Active</option>
        <option value="banned">Banned</option>
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label="Plan">
      <select bind:value={planFilter} on:change={fetchUsers}>
        <option value="all">All plans</option>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
      </select>
    </FieldShell>
  </div>

  <Card class="create-user" variant="soft" padding="md" border="subtle">
    <header class="create-header">
      <h3>Create User</h3>
      <p class="muted">Add an account with role and plan defaults.</p>
    </header>

    <div class="form-grid">
      <FieldShell label="Full name" forId="create-name">
        <input id="create-name" placeholder="Full name" bind:value={newUser.name} />
      </FieldShell>
      <FieldShell label="Email" forId="create-email">
        <input id="create-email" placeholder="Email" bind:value={newUser.email} />
      </FieldShell>
      <FieldShell label="Password (optional)" forId="create-password">
        <input id="create-password" placeholder="Password" type="password" bind:value={newUser.password} />
      </FieldShell>
      <FieldShell label="Role" forId="create-role">
        <select id="create-role" bind:value={newUser.role}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </FieldShell>
      <FieldShell label="Plan" forId="create-plan">
        <select id="create-plan" bind:value={newUser.plan}>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </FieldShell>
      <FieldShell label="Monthly limit" forId="create-limit">
        <input id="create-limit" placeholder="Monthly limit" type="number" bind:value={newUser.monthlyLimit} />
      </FieldShell>
    </div>

    <div class="create-actions">
      <Button type="button" variant="primary" on:click={createUser}>Create User</Button>
    </div>
  </Card>

  {#if error}
    <Card class="alert-error" variant="soft" border="strong" padding="sm">{error}</Card>
  {/if}

  {#if loading}
    <p class="muted">Loading users...</p>
  {:else}
    <div class="bulk-actions">
      <Badge tone="neutral" size="sm">{selectedUserIds.length} selected</Badge>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!selectedUserIds.length}
        on:click={bulkSuspend}
      >
        Suspend Selected
      </Button>
      <Button
        type="button"
        variant="danger"
        size="sm"
        disabled={!selectedUserIds.length}
        on:click={bulkDelete}
      >
        Delete Selected
      </Button>
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
                  checked={allSelected}
                  on:change={toggleSelectAll}
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
                  <Badge tone={user.banned ? 'danger' : 'success'} size="xs">
                    {user.banned ? 'Banned' : 'Active'}
                  </Badge>
                </td>
                <td>{user.plan || 'free'}</td>
                <td>{user.documentCount}</td>
                <td>{formatBytes(user.storageUsed)}</td>
                <td>{user.lastActive ? new Date(user.lastActive).toLocaleString() : '-'}</td>
                <td class="actions">
                  <Button type="button" variant="ghost" size="sm" on:click={() => (selectedUserId = user.id)}>
                    View
                  </Button>
                  <Button type="button" variant={user.banned ? 'success' : 'secondary'} size="sm" on:click={() => toggleBan(user)}>
                    {user.banned ? 'Unban' : 'Ban'}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" on:click={() => toggleRole(user)}>
                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                  <Button type="button" variant="danger" size="sm" on:click={() => deleteUser(user)}>
                    Delete
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</Card>

{#if selectedUserId}
  <UserDetail
    userId={selectedUserId}
    on:close={() => (selectedUserId = null)}
    on:updated={fetchUsers}
  />
{/if}

<style>
  :global(.user-panel) {
    gap: var(--space-4);
  }

  .panel-header {
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
    color: var(--color-text-secondary);
    margin: 0.28rem 0 0;
    display: block;
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-3);
  }

  :global(.create-user) {
    gap: var(--space-3);
  }

  .create-header {
    display: grid;
    gap: 0.15rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-3);
  }

  .create-actions {
    display: flex;
    justify-content: flex-end;
  }

  :global(.alert-error) {
    color: var(--color-danger-soft);
    border-color: color-mix(in srgb, var(--color-danger) 34%, var(--color-border) 66%);
  }

  .bulk-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
  }

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--ui-border-subtle);
    text-align: start;
    vertical-align: top;
  }

  th {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
  }

  td input[type='checkbox'],
  th input[type='checkbox'] {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--color-accent-primary);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  @media (max-width: 768px) {
    .create-actions {
      justify-content: stretch;
    }

    .create-actions :global(.ui-button) {
      width: 100%;
    }
  }
</style>
