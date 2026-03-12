<script>
  import { onDestroy, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import UserDetail from './UserDetail.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';

  const CACHE_KEY = 'page:admin:users';

  let users = [];
  let loading = true;
  let refreshing = false;
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

  async function fetchUsers({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

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
      writePageCache(CACHE_KEY, {
        loaded: true,
        users,
        search,
        roleFilter,
        statusFilter,
        planFilter
      });
      selectedUserIds = selectedUserIds.filter((id) => users.some((user) => user.id === id));
    } catch (err) {
      error = err.message;
    } finally {
      if (background) {
        refreshing = false;
      } else {
        loading = false;
      }
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

    await fetchUsers({ background: true });
  }

  async function toggleRole(user) {
    const role = user.role === 'admin' ? 'user' : 'admin';
    await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    await fetchUsers({ background: true });
  }

  async function deleteUser(user) {
    if (!confirm(`Delete ${user.email}? This removes all data.`)) return;
    await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await fetchUsers({ background: true });
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
    await fetchUsers({ background: true });
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
    await fetchUsers({ background: true });
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
    searchTimeout = setTimeout(() => void fetchUsers({ background: users.length > 0 }), 400);
  }

  function toggleSelectAll() {
    selectedUserIds = selectedUserIds.length === users.length ? [] : users.map((user) => user.id);
  }

  $: allSelected = selectedUserIds.length === users.length && users.length > 0;

  onMount(() => {
    const cached = readPageCache(CACHE_KEY);
    if (cached?.loaded) {
      users = Array.isArray(cached.users) ? cached.users : [];
      search = cached.search || '';
      roleFilter = cached.roleFilter || 'all';
      statusFilter = cached.statusFilter || 'all';
      planFilter = cached.planFilter || 'all';
      loading = false;
    }
    void fetchUsers({ background: Boolean(cached?.loaded) });
  });

  onDestroy(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
  });
</script>

<DataSurface title="Users" description="Search, filter, and manage accounts." tableMinWidth="980px">
  <Button slot="actions" type="button" variant="secondary" size="sm" on:click={() => fetchUsers({ background: users.length > 0 })} disabled={loading || refreshing}>
    {refreshing ? 'Refreshing...' : 'Refresh'}
  </Button>

  <svelte:fragment slot="filters">
    <FieldShell className="filter-field" label="Search">
      <input
        type="search"
        placeholder="Search name or email"
        bind:value={search}
        on:input={handleSearchInput}
      />
    </FieldShell>

    <FieldShell className="filter-field" label="Role">
      <select bind:value={roleFilter} on:change={() => fetchUsers({ background: users.length > 0 })}>
        <option value="all">All roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label="Status">
      <select bind:value={statusFilter} on:change={() => fetchUsers({ background: users.length > 0 })}>
        <option value="all">All status</option>
        <option value="active">Active</option>
        <option value="banned">Banned</option>
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label="Plan">
      <select bind:value={planFilter} on:change={() => fetchUsers({ background: users.length > 0 })}>
        <option value="all">All plans</option>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
      </select>
    </FieldShell>
  </svelte:fragment>

  <Card slot="panels" class="create-user" variant="soft" padding="md" border="subtle">
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

  <svelte:fragment slot="bulk">
    {#if !loading}
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
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="state">
    {#if error}
      <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
    {:else if loading && users.length === 0}
      <p class="ui-data-state-note">Loading users...</p>
    {:else if users.length === 0}
      <p class="ui-data-state-note">No users match your filters.</p>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="table">
    {#if !loading && users.length > 0}
      <table class="ui-data-table">
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
    {/if}
  </svelte:fragment>
</DataSurface>

{#if selectedUserId}
  <UserDetail
    userId={selectedUserId}
    on:close={() => (selectedUserId = null)}
    on:updated={fetchUsers}
  />
{/if}

<style>
  h3 {
    margin: 0;
    color: var(--color-text-primary);
  }

  .muted {
    color: var(--color-text-secondary);
    margin: 0.28rem 0 0;
    display: block;
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

  .bulk-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
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
