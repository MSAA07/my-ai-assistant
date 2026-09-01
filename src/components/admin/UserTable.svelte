<script>
  import { onDestroy, onMount } from 'svelte';
  import { Plus, RefreshCw } from '@lucide/svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import ConfirmModal from '../../lib/components/ui/ConfirmModal.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import ModalSurface from '../../lib/components/ui/ModalSurface.svelte';
  import UserDetail from './UserDetail.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';
  import { toast } from '../../stores/toasts.js';
  import { routeParams, router } from '../../stores/router.js';
  import { buildUserSelection, getSelectedCount } from '../../lib/admin/userSelection.js';

  const CACHE_KEY = 'page:admin:users';
  const createBlankUser = () => ({
    name: '',
    email: '',
    password: '',
    role: 'user',
    plan: 'free',
    usePlanDefaultLimits: true,
    documentCapOverride: '',
    costCapUsdOverride: '',
    tokenCapOverride: ''
  });

  let users = [];
  let loading = true;
  let refreshing = false;
  let error = '';
  let createError = '';
  let search = '';
  let roleFilter = 'all';
  let statusFilter = 'all';
  let planFilter = 'all';
  let selectedUserId = null;
  let createModalOpen = false;
  let creatingUser = false;
  let roleUpdatingId = null;
  let searchTimeout = null;
  let selectedUserIds = [];
  let selectionMode = 'page';
  let total = 0;
  let limit = 25;
  let offset = 0;
  let confirmConfig = null;
  let pendingConfirmAction = null;
  let mutationBusy = false;
  let capDefaults = {
    free: { plan: 'free', documentCap: 5, costCapUsd: 1.5, tokenCap: null },
    premium: { plan: 'premium', documentCap: 100, costCapUsd: null, tokenCap: null }
  };

  let newUser = createBlankUser();

  $: selectedPlanCap = capDefaults[newUser.plan] || capDefaults.free;
  $: defaultLimitCopy = buildDefaultLimitCopy(newUser.plan, selectedPlanCap);

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
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    return params.toString();
  };

  $: currentPage = Math.floor(offset / limit) + 1;
  $: totalPages = Math.max(1, Math.ceil(total / limit));
  $: pageStart = total === 0 ? 0 : offset + 1;
  $: pageEnd = Math.min(offset + users.length, total);
  $: selectedCount = getSelectedCount({ mode: selectionMode, ids: selectedUserIds, total });
  $: if ($routeParams.userId && selectedUserId !== $routeParams.userId) selectedUserId = $routeParams.userId;

  function openUser(userId) {
    selectedUserId = userId;
    router.navigate(`/admin/users?userId=${encodeURIComponent(userId)}`);
  }

  function closeUser() {
    selectedUserId = null;
    if ($routeParams.userId) router.navigate('/admin/users', { replace: true });
  }

  function formatCapNumber(value) {
    return value === null || value === undefined ? 'unlimited' : Number(value).toLocaleString();
  }

  function formatCapUsd(value) {
    return value === null || value === undefined ? 'unlimited' : `$${Number(value || 0).toFixed(2)} USD`;
  }

  function buildDefaultLimitCopy(plan, cap) {
    const planName = plan === 'premium' ? 'Premium' : 'Free';
    const docs = formatCapNumber(cap?.documentCap);
    const cost = formatCapUsd(cap?.costCapUsd);
    const token = cap?.tokenCap === null || cap?.tokenCap === undefined
      ? ''
      : ` and ${formatCapNumber(cap.tokenCap)} tokens`;
    return `This user will use the ${planName} plan defaults: ${docs} documents and ${cost} cost cap${token}.`;
  }

  function formatTelegramCounts(telegram = {}) {
    const flashcards = Number(telegram.flashcardSendCount || 0);
    const exams = Number(telegram.examSendCount || 0);
    if (flashcards === 0 && exams === 0) return 'No sends';
    return `${flashcards} flashcards / ${exams} exams`;
  }

  function parseOptionalInteger(value, label) {
    if (value === '' || value === null || value === undefined) return { valid: true };
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
      return { valid: false, error: `${label} must be an integer greater than or equal to 0.` };
    }
    return { valid: true, value: parsed };
  }

  function parseOptionalNumber(value, label) {
    if (value === '' || value === null || value === undefined) return { valid: true };
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { valid: false, error: `${label} must be a number greater than or equal to 0.` };
    }
    return { valid: true, value: parsed };
  }

  async function fetchCapDefaults() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/caps/defaults`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch cap defaults');
      for (const cap of data.caps || []) {
        capDefaults = {
          ...capDefaults,
          [cap.plan]: cap
        };
      }
    } catch (err) {
      console.warn('Failed to fetch cap defaults', err);
    }
  }

  async function fetchUsers({ background = false, resetPage = false } = {}) {
    if (resetPage) offset = 0;
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
      total = Number(data.total || 0);
      limit = Number(data.limit || limit);
      offset = Number(data.offset || 0);
      writePageCache(CACHE_KEY, {
        loaded: true,
        users,
        search,
        roleFilter,
        statusFilter,
        planFilter,
        total,
        limit,
        offset
      });
      if (selectionMode === 'page') {
        selectedUserIds = selectedUserIds.filter((id) => users.some((user) => user.id === id));
      }
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

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: user.banned ? 'Admin restored access' : 'Admin suspended access' })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to change user status');
      toast.success(user.banned ? 'User access restored.' : 'User suspended.');
      await fetchUsers({ background: true });
    } catch (err) {
      toast.error(err.message || 'Failed to change user status');
    }
  }

  async function updateUserRole(user, role) {
    if (!role || role === (user.role || 'user')) return;

    roleUpdatingId = user.id;
    error = '';

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }
      toast.success('User role updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      roleUpdatingId = null;
      await fetchUsers({ background: true });
    }
  }

  async function deleteUser(user) {
    openConfirmation({
      title: 'Delete account',
      description: `Permanently delete ${user.email} and all associated data.`,
      confirmLabel: 'Delete account',
      severity: 'danger',
      typedConfirmation: { value: 'DELETE', prompt: 'Type', suffix: 'to continue.' }
    }, async () => {
      mutationBusy = true;
      let succeeded = false;
      try {
        const response = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmation: 'DELETE' })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Failed to delete account');
        toast.success('Account deleted.');
        succeeded = true;
        await fetchUsers({ background: true });
      } catch (err) {
        toast.error(err.message || 'Failed to delete account');
      } finally {
        mutationBusy = false;
      }
      if (succeeded) closeConfirmation();
    });
  }

  function getSelectionPayload() {
    return buildUserSelection({
      mode: selectionMode,
      ids: selectedUserIds,
      filters: { search, role: roleFilter, status: statusFilter, plan: planFilter }
    });
  }

  async function beginBulkAction(action) {
    if (!selectedCount) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/bulk-action`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, selection: getSelectionPayload(), preview: true })
      });
      const preview = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(preview.error || 'Failed to preview bulk action');
      const excludedCount = preview.excluded?.length || 0;
      openConfirmation({
        title: `${action === 'delete' ? 'Delete' : 'Suspend'} ${preview.affected} users`,
        description: `${preview.affected} eligible of ${preview.matched} matched users will be affected.${excludedCount ? ` ${excludedCount} ineligible users will be excluded automatically.` : ''}`,
        confirmLabel: action === 'delete' ? 'Delete users' : 'Suspend users',
        severity: 'danger',
        typedConfirmation: { value: preview.confirmationText, prompt: 'Type', suffix: 'to commit this bulk action.' }
      }, () => executeBulkAction(action, preview.confirmationText));
    } catch (err) {
      toast.error(err.message || 'Failed to preview bulk action');
    }
  }

  async function executeBulkAction(action, confirmation) {
    mutationBusy = true;
    let succeeded = false;
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/bulk-action`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, selection: getSelectionPayload(), confirmation, reason: 'Bulk admin action' })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Bulk action failed');
      toast.success(`${data.affected} users ${action === 'delete' ? 'deleted' : 'suspended'}.`);
      selectedUserIds = [];
      selectionMode = 'page';
      succeeded = true;
      await fetchUsers({ background: true });
    } catch (err) {
      toast.error(err.message || 'Bulk action failed');
    } finally {
      mutationBusy = false;
    }
    if (succeeded) closeConfirmation();
  }

  function openConfirmation(config, action) {
    confirmConfig = config;
    pendingConfirmAction = action;
  }

  function closeConfirmation() {
    if (mutationBusy) return;
    confirmConfig = null;
    pendingConfirmAction = null;
  }

  function openCreateModal() {
    createError = '';
    createModalOpen = true;
  }

  function closeCreateModal() {
    if (creatingUser) return;
    createModalOpen = false;
    createError = '';
    newUser = createBlankUser();
  }

  async function createUser() {
    createError = '';
    const email = newUser.email.trim();

    if (!email || !newUser.name.trim()) {
      createError = 'Name and email are required.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      createError = 'Enter a valid email address.';
      return;
    }

    if (!newUser.password.trim()) {
      createError = 'Temporary password is required.';
      return;
    }

    if (!newUser.role) {
      createError = 'Role is required.';
      return;
    }

    if (!newUser.plan) {
      createError = 'Plan is required.';
      return;
    }

    const payload = {
      name: newUser.name.trim(),
      email,
      password: newUser.password,
      role: newUser.role,
      plan: newUser.plan
    };

    if (!newUser.usePlanDefaultLimits) {
      const documentCap = parseOptionalInteger(newUser.documentCapOverride, 'Document cap override');
      if (!documentCap.valid) {
        createError = documentCap.error;
        return;
      }

      const costCap = parseOptionalNumber(newUser.costCapUsdOverride, 'Cost cap override');
      if (!costCap.valid) {
        createError = costCap.error;
        return;
      }

      const tokenCap = parseOptionalInteger(newUser.tokenCapOverride, 'Token cap override');
      if (!tokenCap.valid) {
        createError = tokenCap.error;
        return;
      }

      if (documentCap.value !== undefined) payload.documentCapOverride = documentCap.value;
      if (costCap.value !== undefined) payload.costCapUsdOverride = costCap.value;
      if (tokenCap.value !== undefined) payload.tokenCapOverride = tokenCap.value;
    }

    creatingUser = true;

    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        createError = data.error || 'Failed to create user';
        toast.error(createError);
        return;
      }

      newUser = createBlankUser();
      createModalOpen = false;
      error = '';
      toast.success('User created.');
      await fetchUsers({ background: users.length > 0 });
    } catch (err) {
      createError = err.message || 'Failed to create user';
      toast.error(createError);
    } finally {
      creatingUser = false;
    }
  }

  function handleSearchInput() {
    if (searchTimeout) clearTimeout(searchTimeout);
    clearSelection();
    searchTimeout = setTimeout(() => void fetchUsers({ background: users.length > 0, resetPage: true }), 400);
  }

  function handleFilterChange() {
    clearSelection();
    void fetchUsers({ background: users.length > 0, resetPage: true });
  }

  function toggleSelectAll() {
    selectionMode = 'page';
    selectedUserIds = selectedUserIds.length === users.length ? [] : users.map((user) => user.id);
  }

  function toggleUserSelection(userId, checked) {
    selectionMode = 'page';
    selectedUserIds = checked
      ? [...new Set([...selectedUserIds, userId])]
      : selectedUserIds.filter((id) => id !== userId);
  }

  function selectAllMatching() {
    selectionMode = 'matching';
    selectedUserIds = [];
  }

  function clearSelection() {
    selectionMode = 'page';
    selectedUserIds = [];
  }

  function changePage(nextPage) {
    const bounded = Math.min(Math.max(nextPage, 1), totalPages);
    offset = (bounded - 1) * limit;
    if (selectionMode === 'page') selectedUserIds = [];
    void fetchUsers({ background: true });
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
      total = Number(cached.total || users.length);
      limit = Number(cached.limit || 25);
      offset = Number(cached.offset || 0);
      loading = false;
    }
    void fetchUsers({ background: Boolean(cached?.loaded) });
    void fetchCapDefaults();
  });

  onDestroy(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
  });
</script>

<DataSurface title="Users" description="Search, filter, and manage accounts." tableMinWidth="1160px">
  <svelte:fragment slot="actions">
    <Button type="button" variant="secondary" size="sm" on:click={() => fetchUsers({ background: users.length > 0 })} disabled={loading || refreshing}>
      <svelte:fragment slot="icon">
        <RefreshCw aria-hidden="true" />
      </svelte:fragment>
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
    <Button type="button" variant="primary" size="sm" on:click={openCreateModal}>
      <svelte:fragment slot="icon">
        <Plus aria-hidden="true" />
      </svelte:fragment>
      Create User
    </Button>
  </svelte:fragment>

  <svelte:fragment slot="filters">
    <FieldShell className="filter-field search-field" label="Search">
      <input
        type="search"
        placeholder="Search name or email"
        bind:value={search}
        on:input={handleSearchInput}
      />
    </FieldShell>

    <FieldShell className="filter-field" label="Role">
      <select bind:value={roleFilter} on:change={handleFilterChange}>
        <option value="all">All roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label="Status">
      <select bind:value={statusFilter} on:change={handleFilterChange}>
        <option value="all">All status</option>
        <option value="active">Active</option>
        <option value="banned">Banned</option>
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label="Plan">
      <select bind:value={planFilter} on:change={handleFilterChange}>
        <option value="all">All plans</option>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
      </select>
    </FieldShell>
  </svelte:fragment>

  <svelte:fragment slot="bulk">
    {#if !loading}
      <div class="bulk-actions">
        <Badge tone={selectionMode === 'matching' ? 'accent' : 'neutral'} size="sm">{selectedCount} selected</Badge>
        {#if selectionMode === 'page' && selectedUserIds.length === users.length && total > users.length}
          <Button type="button" variant="ghost" size="sm" on:click={selectAllMatching}>Select all {total} matching</Button>
        {:else if selectionMode === 'matching'}
          <span class="selection-copy">All {total} matching users selected.</span>
          <Button type="button" variant="ghost" size="sm" on:click={clearSelection}>Clear</Button>
        {/if}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!selectedCount}
          on:click={() => beginBulkAction('suspend')}
        >
          Suspend Selected
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={!selectedCount}
          on:click={() => beginBulkAction('delete')}
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
                checked={selectionMode === 'matching' || allSelected}
                disabled={selectionMode === 'matching'}
                on:change={toggleSelectAll}
              />
            </th>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Plan</th>
            <th>Telegram</th>
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
                <input
                  type="checkbox"
                  value={user.id}
                  disabled={selectionMode === 'matching'}
                  checked={selectionMode === 'matching' || selectedUserIds.includes(user.id)}
                  on:change={(event) => toggleUserSelection(user.id, event.currentTarget.checked)}
                />
              </td>
              <td>
                <strong>{user.name || 'Unnamed user'}</strong>
                <span class="muted">{user.email}</span>
              </td>
              <td class="role-cell">
                <select
                  class="role-select"
                  aria-label={`Role for ${user.email}`}
                  value={user.role || 'user'}
                  disabled={roleUpdatingId === user.id}
                  on:change={(event) => updateUserRole(user, event.currentTarget.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <Badge tone={user.banned ? 'danger' : 'success'} size="xs">
                  {user.banned ? 'Banned' : 'Active'}
                </Badge>
              </td>
              <td>
                <Badge tone={(user.plan || 'free') === 'premium' ? 'accent' : 'neutral'} size="xs">
                  {user.plan || 'free'}
                </Badge>
              </td>
              <td>
                <Badge tone={user.telegram?.connected ? 'success' : 'neutral'} size="xs">
                  {user.telegram?.connected ? 'Connected' : 'Not connected'}
                </Badge>
                <span class="muted">{formatTelegramCounts(user.telegram)}</span>
              </td>
              <td>{user.documentCount ?? 0}</td>
              <td>{formatBytes(user.storageUsed)}</td>
              <td>{user.lastActive ? new Date(user.lastActive).toLocaleString() : '-'}</td>
              <td class="actions-cell">
                <Button type="button" variant="ghost" size="sm" on:click={() => openUser(user.id)}>
                  View
                </Button>
                <Button type="button" variant={user.banned ? 'success' : 'warning'} size="sm" on:click={() => toggleBan(user)}>
                  {user.banned ? 'Restore' : 'Suspend'}
                </Button>
                <Button type="button" variant="danger" size="sm" on:click={() => deleteUser(user)}>
                  Delete
                </Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div class="pagination-bar">
        <p>Showing {pageStart}-{pageEnd} of {total} users</p>
        <div class="pagination-actions">
          <Button type="button" variant="secondary" size="sm" disabled={currentPage <= 1 || loading} on:click={() => changePage(currentPage - 1)}>Previous</Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button type="button" variant="secondary" size="sm" disabled={currentPage >= totalPages || loading} on:click={() => changePage(currentPage + 1)}>Next</Button>
        </div>
      </div>
    {/if}
  </svelte:fragment>
</DataSurface>

<ModalSurface
  open={createModalOpen}
  width="min(720px, 100%)"
  labelledBy="create-user-heading"
  describedBy="create-user-description"
  className="create-user-modal"
  on:close={closeCreateModal}
>
  <form class="create-user-form" on:submit|preventDefault={createUser}>
    <header class="create-modal-header">
      <div>
        <h2 id="create-user-heading">Create User</h2>
        <p id="create-user-description" class="muted">Add a login-ready account with plan-based usage caps.</p>
      </div>
    </header>

    {#if createError}
      <Card class="create-error" variant="soft" border="strong" padding="sm">{createError}</Card>
    {/if}

    <div class="form-grid modal-form-grid">
      <FieldShell label="Full name" forId="create-name" required>
        <input id="create-name" placeholder="Full name" bind:value={newUser.name} autocomplete="name" required />
      </FieldShell>
      <FieldShell label="Email" forId="create-email" required>
        <input id="create-email" placeholder="Email" type="email" bind:value={newUser.email} autocomplete="email" required />
      </FieldShell>
      <FieldShell
        className="modal-password-field"
        label="Temporary password"
        forId="create-password"
        hint="The user can sign in with this password. Use a temporary password and ask them to change it later."
        required
      >
        <input id="create-password" placeholder="Temporary password" type="password" bind:value={newUser.password} autocomplete="new-password" required />
      </FieldShell>
      <FieldShell label="Role" forId="create-role" required>
        <select id="create-role" bind:value={newUser.role} required>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </FieldShell>
      <FieldShell className="modal-field-full" label="Plan" forId="create-plan" required>
        <select id="create-plan" bind:value={newUser.plan} required>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </FieldShell>
    </div>

    <div class="limit-settings">
      <label class="check-row" for="create-use-default-limits">
        <input id="create-use-default-limits" type="checkbox" bind:checked={newUser.usePlanDefaultLimits} />
        <span>
          <strong>Use plan default limits</strong>
          <small>{defaultLimitCopy}</small>
        </span>
      </label>

      {#if !newUser.usePlanDefaultLimits}
        <div class="custom-limits">
          <p class="muted">Custom limits override the plan defaults only for this user.</p>
          <div class="form-grid modal-form-grid">
            <FieldShell label="Document cap override" forId="create-document-cap" hint="Leave empty to use the selected plan default.">
              <input id="create-document-cap" placeholder="Plan default" type="number" min="0" step="1" bind:value={newUser.documentCapOverride} />
            </FieldShell>
            <FieldShell label="Cost cap override (USD)" forId="create-cost-cap" hint="Leave empty to use the selected plan default.">
              <input id="create-cost-cap" placeholder="Plan default" type="number" min="0" step="0.01" bind:value={newUser.costCapUsdOverride} />
            </FieldShell>
            <FieldShell label="Token cap override" forId="create-token-cap" hint="Leave empty to use the selected plan default.">
              <input id="create-token-cap" placeholder="Plan default" type="number" min="0" step="1" bind:value={newUser.tokenCapOverride} />
            </FieldShell>
          </div>
        </div>
      {/if}
    </div>

    <footer class="modal-actions">
      <Button type="button" variant="secondary" on:click={closeCreateModal} disabled={creatingUser}>Cancel</Button>
      <Button type="submit" variant="primary" className="modal-submit-button" loading={creatingUser}>Create User</Button>
    </footer>
  </form>
</ModalSurface>

{#if selectedUserId}
  <UserDetail
    userId={selectedUserId}
    on:close={closeUser}
    on:updated={fetchUsers}
  />
{/if}

{#if confirmConfig}
  <ConfirmModal
    open
    title={confirmConfig.title}
    description={confirmConfig.description}
    confirmLabel={confirmConfig.confirmLabel}
    severity={confirmConfig.severity}
    typedConfirmation={confirmConfig.typedConfirmation}
    busy={mutationBusy}
    on:cancel={closeConfirmation}
    on:confirm={() => pendingConfirmAction?.()}
  />
{/if}

<style>
  h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0;
  }

  .muted {
    color: var(--color-text-secondary);
    margin: 0.2rem 0 0;
    font-size: var(--font-size-xs);
    display: block;
    overflow-wrap: anywhere;
  }

  :global(.ui-data-surface__filters .search-field) {
    flex: 2 1 340px;
    min-width: min(100%, 280px);
  }

  :global(.create-user-modal.ui-modal) {
    gap: 0;
  }

  .create-user-form {
    display: grid;
    gap: var(--space-4);
  }

  .create-modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-3);
  }

  .modal-form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  :global(.create-user-modal .modal-field-full) {
    grid-column: 1 / -1;
  }

  :global(.create-user-modal .ui-field__label) {
    font-size: var(--font-size-sm);
    font-weight: 500;
  }

  :global(.create-user-modal .ui-field__required) {
    color: var(--color-danger);
  }

  :global(.create-user-modal .modal-password-field) {
    min-width: 0;
  }

  :global(.create-user-modal .modal-password-field .ui-field__meta) {
    width: 100%;
    max-width: 100%;
    justify-self: stretch;
    overflow-wrap: anywhere;
  }

  :global(.create-user-modal .ui-field__control select) {
    min-height: var(--ui-control-height-md);
    padding: 0.5rem 0.75rem;
    padding-inline-end: 2rem;
    border: none;
    border-radius: inherit;
    background-color: var(--ui-surface-base);
    background-image:
      linear-gradient(45deg, transparent 50%, var(--color-text-muted) 50%),
      linear-gradient(135deg, var(--color-text-muted) 50%, transparent 50%);
    background-position:
      calc(100% - 14px) calc(50% - 2px),
      calc(100% - 9px) calc(50% - 2px);
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    color: var(--color-text-primary);
    font: inherit;
    font-size: var(--font-size-sm);
    line-height: 1.35;
    box-shadow: none;
  }

  :global(.create-user-modal .ui-field__control:focus-within select) {
    background-color: var(--ui-surface-raised);
  }

  :global(html[dir='rtl'] .create-user-modal .ui-field__control select) {
    background-position:
      14px calc(50% - 2px),
      19px calc(50% - 2px);
  }

  .limit-settings,
  .custom-limits {
    display: grid;
    gap: var(--space-2);
  }

  .check-row {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.75rem;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-surface-secondary);
    color: var(--color-text-primary);
  }

  .check-row input {
    width: 16px;
    height: 16px;
    margin-top: 0.12rem;
    accent-color: var(--color-accent-primary);
    flex: 0 0 auto;
  }

  .check-row span {
    display: grid;
    gap: 0.18rem;
    min-width: 0;
  }

  .check-row strong {
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  .check-row small {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    line-height: 1.45;
  }

  .modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding-top: var(--space-1);
  }

  :global(.create-user-modal .modal-submit-button.ui-button) {
    --button-bg: var(--ui-accent-info);
    --button-bg-hover: color-mix(in srgb, var(--ui-accent-info) 88%, black 12%);
    --button-bg-active: color-mix(in srgb, var(--ui-accent-info) 78%, black 22%);
    --button-fg: #ffffff;
    --button-fg-hover: #ffffff;
    --button-shadow: inset 0 0 0 1px color-mix(in srgb, #ffffff 14%, transparent);
  }

  :global(.create-error) {
    color: color-mix(in srgb, var(--ui-accent-danger) 78%, var(--ui-text-primary) 22%);
    border-color: color-mix(in srgb, var(--ui-accent-danger) 34%, var(--ui-border-default) 66%);
  }

  .bulk-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: 0.45rem 0.55rem;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--ui-surface-base) 94%, transparent);
  }

  .selection-copy {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-label);
  }

  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    padding-top: var(--ui-space-3);
  }

  .pagination-bar p,
  .pagination-actions span {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-label);
  }

  .pagination-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-2);
  }

  td input[type='checkbox'],
  th input[type='checkbox'] {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--color-accent-primary);
  }

  .role-cell {
    min-width: 122px;
  }

  .role-select {
    width: 112px;
    min-height: 2rem;
    padding-block: 0;
    padding-inline-start: 0.65rem;
    padding-inline-end: 1.8rem;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    background-color: var(--ui-surface-card);
    color: var(--ui-text-primary);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: capitalize;
    cursor: pointer;
    box-shadow: inset 0 0 0 1px transparent;
  }

  .role-select:hover:not(:disabled) {
    border-color: var(--ui-border-strong);
    background-color: var(--ui-surface-secondary);
  }

  .role-select:focus-visible {
    border-color: var(--ui-border-focus);
    box-shadow: var(--ui-focus-ring-strong);
  }

  .actions-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    min-width: 230px;
    overflow: visible;
  }

  .actions-cell :global(.ui-button) {
    min-width: 4.75rem;
    white-space: nowrap;
  }

  :global(.ui-data-table td:first-child) {
    width: 34px;
  }

  :global(.ui-data-table td:nth-child(2)) {
    min-width: 170px;
  }

  :global(.ui-data-table td:nth-child(8)) {
    min-width: 150px;
  }

  :global(.ui-data-table td:nth-child(10)),
  :global(.ui-data-table th:nth-child(10)) {
    min-width: 230px;
  }

  @media (max-width: 768px) {
    .bulk-actions {
      align-items: stretch;
    }

    .bulk-actions :global(.ui-button) {
      flex: 1;
      min-width: 0;
    }

    .modal-form-grid {
      grid-template-columns: 1fr;
    }

    .modal-actions {
      justify-content: stretch;
    }

    .modal-actions :global(.ui-button) {
      width: 100%;
    }
  }
</style>
