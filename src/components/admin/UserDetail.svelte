<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import ModalSurface from '../../lib/components/ui/ModalSurface.svelte';
  import Tabs from '../../lib/components/ui/Tabs.svelte';
  import UsageBreakdownTable from './UsageBreakdownTable.svelte';
  import { API_BASE } from '../../config.js';

  export let userId;

  const dispatch = createEventDispatcher();

  const tabItems = [
    { value: 'profile', label: 'Profile' },
    { value: 'files', label: 'Files' },
    { value: 'sessions', label: 'Sessions' },
    { value: 'limits', label: 'Limits' },
    { value: 'usage', label: 'Usage' }
  ];

  let user = null;
  let stats = null;
  let documents = [];
  let sessions = [];
  let usageDetail = null;
  let userLimit = null;
  let allowance = null;
  let loading = true;
  let error = '';
  let limitsError = '';
  let limitsSaving = false;
  let activeTab = 'profile';

  let form = {
    name: '',
    plan: 'free',
    role: 'user'
  };
  let limitForm = {
    documentCapOverride: '',
    costCapUsdOverride: '',
    tokenCapOverride: '',
    reason: ''
  };

  $: usageTotals = usageDetail?.totals || {};
  $: usageFeatures = usageDetail?.features || [];
  $: usageModels = usageDetail?.models || [];
  $: usageDocuments = usageDetail?.documents || [];
  $: usageSeries = usageDetail?.series || [];
  $: limitConsumed = allowance?.consumed || {};
  $: limitCaps = allowance?.caps || {};
  $: limitRemaining = allowance?.remaining || {};
  $: limitOverrides = allowance?.overrides || {};
  $: proposedDocumentOverride = parseNullableInteger(limitForm.documentCapOverride);
  $: proposedCostOverride = parseNullableNumber(limitForm.costCapUsdOverride);
  $: proposedTokenOverride = parseNullableInteger(limitForm.tokenCapOverride);
  $: loweringUserCaps = Boolean(
    allowance && (
      isLowering(proposedDocumentOverride, limitCaps.documentCap)
      || isLowering(proposedCostOverride, limitCaps.costCapUsd)
      || isLowering(proposedTokenOverride, limitCaps.tokenCap)
    )
  );
  $: proposedOverLimit = Boolean(
    allowance && (
      (proposedDocumentOverride !== null && Number(limitConsumed.documents || 0) >= proposedDocumentOverride)
      || (proposedCostOverride !== null && Number(limitConsumed.costUsd || 0) >= proposedCostOverride)
      || (proposedTokenOverride !== null && Number(limitConsumed.totalTokens || 0) >= proposedTokenOverride)
    )
  );

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0);
    if (!value) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const size = value / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const formatUsd = (value) => `$${Number(value || 0).toFixed(4)}`;
  const formatSar = (value) => `${Number(value || 0).toFixed(2)} SAR`;
  const formatNumber = (value) => Number(value || 0).toLocaleString();
  const formatCap = (value, formatter = formatNumber) => value === null || value === undefined ? 'Unlimited' : formatter(value);
  const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

  function parseNullableInteger(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
  }

  function parseNullableNumber(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  function isLowering(nextValue, currentValue) {
    if (nextValue === null || currentValue === null || currentValue === undefined) return false;
    return Number(nextValue) < Number(currentValue);
  }

  function hydrateLimitForm(nextUserLimit, nextAllowance) {
    userLimit = nextUserLimit;
    allowance = nextAllowance;
    limitForm = {
      documentCapOverride: nextUserLimit?.documentCapOverride ?? '',
      costCapUsdOverride: nextUserLimit?.costCapUsdOverride ?? '',
      tokenCapOverride: nextUserLimit?.tokenCapOverride ?? '',
      reason: ''
    };
  }

  async function fetchUser() {
    loading = true;
    error = '';

    try {
      const [userRes, fileRes, sessionRes, usageRes, limitsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users/${userId}`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/users/${userId}/files`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/users/${userId}/sessions`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/usage/users/${userId}?granularity=day`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/users/${userId}/limits`, { credentials: 'include' })
      ]);

      const userData = await userRes.json();
      const fileData = await fileRes.json();
      const sessionData = await sessionRes.json();
      const usageData = await usageRes.json();
      const limitsData = await limitsRes.json();

      if (!userRes.ok) throw new Error(userData.error || 'Failed to fetch user');
      if (!fileRes.ok) throw new Error(fileData.error || 'Failed to fetch files');
      if (!sessionRes.ok) throw new Error(sessionData.error || 'Failed to fetch sessions');
      if (!usageRes.ok) throw new Error(usageData.error || 'Failed to fetch usage');
      if (!limitsRes.ok) throw new Error(limitsData.error || 'Failed to fetch limits');

      user = userData.user;
      stats = userData.stats;
      documents = fileData.documents || [];
      sessions = sessionData.sessions || [];
      usageDetail = usageData;
      hydrateLimitForm(limitsData.userLimit, limitsData.allowance);

      form = {
        name: user.name,
        plan: user.plan,
        role: user.role || 'user'
      };
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function updateUser() {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        plan: form.plan,
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

  async function saveLimitOverrides() {
    limitsError = '';

    if ((loweringUserCaps || proposedOverLimit) && !limitForm.reason.trim()) {
      limitsError = 'Add a reason before lowering caps or placing this user over cap.';
      return;
    }

    if (loweringUserCaps || proposedOverLimit) {
      const warning = [
        'Save this user cap override?',
        proposedOverLimit ? 'The user is already at or above one proposed cap.' : '',
        'This change is audited.'
      ].filter(Boolean).join('\n');
      if (!confirm(warning)) return;
    }

    limitsSaving = true;

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/limits/overrides`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentCapOverride: limitForm.documentCapOverride === '' ? null : Number(limitForm.documentCapOverride),
          costCapUsdOverride: limitForm.costCapUsdOverride === '' ? null : Number(limitForm.costCapUsdOverride),
          tokenCapOverride: limitForm.tokenCapOverride === '' ? null : Number(limitForm.tokenCapOverride),
          reason: limitForm.reason.trim() || null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save overrides');
      hydrateLimitForm(data.userLimit, data.allowance);
      dispatch('updated');
    } catch (err) {
      limitsError = err.message;
    } finally {
      limitsSaving = false;
    }
  }

  async function clearLimitOverrides() {
    limitsError = '';
    if (!confirm('Clear this user’s cap overrides? This is audited.')) return;
    limitsSaving = true;

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/limits/overrides/clear`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: ['documentCapOverride', 'costCapUsdOverride', 'tokenCapOverride'],
          reason: limitForm.reason.trim() || null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to clear overrides');
      hydrateLimitForm(data.userLimit, data.allowance);
      dispatch('updated');
    } catch (err) {
      limitsError = err.message;
    } finally {
      limitsSaving = false;
    }
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
    <Button type="button" variant="secondary" size="sm" on:click={() => dispatch('close')}>Close</Button>
  </header>

  {#if loading}
    <p class="muted state-note">Loading...</p>
  {:else if error}
    <Card class="error-card" variant="soft" border="strong" padding="sm">{error}</Card>
  {:else}
    <Tabs
      className="user-detail-tabs"
      items={tabItems}
      value={activeTab}
      ariaLabel="User detail sections"
      mobileScrollable
      on:change={handleTabChange}
    />

    {#if activeTab === 'profile'}
      <div class="profile-grid">
        <Card class="detail-card" variant="base" padding="md">
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

        <Card class="detail-card" variant="base" padding="md">
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
      <Card class="detail-card" variant="base" padding="md">
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
    {:else if activeTab === 'sessions'}
      <Card class="detail-card" variant="base" padding="md">
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
    {:else if activeTab === 'limits'}
      <div class="limits-panel">
        <Card class="detail-card" variant="base" padding="md">
          <header class="card-header">
            <h3>Usage Limits</h3>
            {#if limitOverrides.overrideBy}
              <Badge tone="warning" size="sm">Override active</Badge>
            {:else}
              <Badge tone="neutral" size="sm">Default caps</Badge>
            {/if}
          </header>

          <div class="usage-metric-grid">
            <div><span>Consumed USD</span><strong>{formatUsd(limitConsumed.costUsd)}</strong></div>
            <div><span>Cost Cap</span><strong>{formatCap(limitCaps.costCapUsd, formatUsd)}</strong></div>
            <div><span>Remaining USD</span><strong>{formatCap(limitRemaining.costUsd, formatUsd)}</strong></div>
            <div><span>Documents</span><strong>{formatNumber(limitConsumed.documents)}</strong></div>
            <div><span>Document Cap</span><strong>{formatCap(limitCaps.documentCap)}</strong></div>
            <div><span>Remaining Docs</span><strong>{formatCap(limitRemaining.documents)}</strong></div>
            <div><span>Total Tokens</span><strong>{formatNumber(limitConsumed.totalTokens)}</strong></div>
            <div><span>Token Cap</span><strong>{formatCap(limitCaps.tokenCap)}</strong></div>
            <div><span>Remaining Tokens</span><strong>{formatCap(limitRemaining.tokens)}</strong></div>
          </div>

          <p class="muted">
            Cost allowance is calculated dynamically as active cap minus billable ledger spend.
          </p>
        </Card>

        <Card class="detail-card" variant="base" padding="md">
          <header class="card-header">
            <h3>Cap Overrides</h3>
            {#if loweringUserCaps || proposedOverLimit}
              <Badge tone="warning" size="sm">Reason required</Badge>
            {/if}
          </header>

          <div class="field-grid">
            <FieldShell label="Document Cap Override" forId="user-document-cap-override">
              <input id="user-document-cap-override" type="number" min="0" bind:value={limitForm.documentCapOverride} placeholder="Use default" />
            </FieldShell>
            <FieldShell label="USD Cost Cap Override" forId="user-cost-cap-override">
              <input id="user-cost-cap-override" type="number" min="0" step="0.0001" bind:value={limitForm.costCapUsdOverride} placeholder="Use default" />
            </FieldShell>
            <FieldShell label="Token Cap Override" forId="user-token-cap-override">
              <input id="user-token-cap-override" type="number" min="0" bind:value={limitForm.tokenCapOverride} placeholder="Use default" />
            </FieldShell>
            <FieldShell label="Reason" forId="user-limit-reason">
              <textarea id="user-limit-reason" rows="3" bind:value={limitForm.reason} placeholder="Required for high-impact changes"></textarea>
            </FieldShell>
          </div>

          {#if limitsError}
            <Card class="error-card" variant="soft" border="strong" padding="sm">{limitsError}</Card>
          {/if}

          <div class="actions">
            <Button type="button" variant="primary" size="sm" on:click={saveLimitOverrides} disabled={limitsSaving}>
              {limitsSaving ? 'Saving...' : 'Save Overrides'}
            </Button>
            <Button type="button" variant="secondary" size="sm" on:click={clearLimitOverrides} disabled={limitsSaving}>
              Clear Overrides
            </Button>
          </div>
        </Card>
      </div>
    {:else if activeTab === 'usage'}
      <div class="usage-panel">
        <Card class="detail-card" variant="base" padding="md">
          <header class="card-header">
            <h3>Usage & Cost</h3>
            <Badge tone="neutral" size="sm">Daily</Badge>
          </header>

          <div class="usage-metric-grid">
            <div><span>USD Cost</span><strong>{formatUsd(usageTotals.costUsd)}</strong></div>
            <div><span>SAR Approx.</span><strong>{formatSar(usageTotals.costSar)}</strong></div>
            <div><span>Total Tokens</span><strong>{formatNumber(usageTotals.totalTokens)}</strong></div>
            <div><span>Input Tokens</span><strong>{formatNumber(usageTotals.inputTokens)}</strong></div>
            <div><span>Output Tokens</span><strong>{formatNumber(usageTotals.outputTokens)}</strong></div>
            <div><span>Events</span><strong>{formatNumber(usageTotals.events)}</strong></div>
          </div>

          <p class="muted">
            SAR uses fixed rate {usageDetail?.sarRate ?? 3.75} and is approximate.
          </p>
        </Card>

        <div class="usage-breakdowns">
          <UsageBreakdownTable title="Documents" rows={usageDocuments} nameKey="document" idKey="documentId" compact />
          <UsageBreakdownTable title="Features" rows={usageFeatures} labelKey="featureKey" compact />
          <UsageBreakdownTable title="Models" rows={usageModels} labelKey="model" compact />
        </div>

        <DataSurface title="Daily Usage" description="Ledger totals by day for this user." tableMinWidth="760px" compact>
          <svelte:fragment slot="table">
            {#if usageSeries.length > 0}
              <table class="ui-data-table">
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th>Events</th>
                    <th>Input</th>
                    <th>Output</th>
                    <th>Total</th>
                    <th>USD</th>
                    <th>SAR</th>
                  </tr>
                </thead>
                <tbody>
                  {#each usageSeries as item}
                    <tr>
                      <td><strong>{formatDate(item.bucketStart)}</strong></td>
                      <td>{formatNumber(item.events)}</td>
                      <td>{formatNumber(item.inputTokens)}</td>
                      <td>{formatNumber(item.outputTokens)}</td>
                      <td>{formatNumber(item.totalTokens)}</td>
                      <td>{formatUsd(item.costUsd)}</td>
                      <td>{formatSar(item.costSar)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              <p class="ui-data-state-note">No model usage recorded for this user.</p>
            {/if}
          </svelte:fragment>
        </DataSurface>
      </div>
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

  h2 {
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  h3 {
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  .muted {
    margin: 0.22rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    display: block;
  }

  .state-note {
    margin: 0;
    padding: 0.48rem 0.6rem;
    border: 1px dashed var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--ui-surface-base) 94%, transparent);
  }

  :global(.user-detail-tabs) {
    width: 100%;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-3);
  }

  :global(.detail-card) {
    gap: var(--space-2);
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
    font-size: var(--font-size-sm);
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
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--ui-surface-base) 92%, transparent);
    padding: 0.54rem 0.62rem;
  }

  .item-list li .muted {
    word-break: break-word;
  }

  .limits-panel,
  .usage-panel,
  .usage-breakdowns {
    display: grid;
    gap: var(--space-3);
    min-width: 0;
  }

  .usage-breakdowns {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .usage-metric-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .usage-metric-grid div {
    display: grid;
    gap: 0.16rem;
    min-width: 0;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--ui-surface-base) 92%, transparent);
    padding: 0.58rem 0.62rem;
  }

  .usage-metric-grid span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }

  .usage-metric-grid strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  textarea {
    resize: vertical;
  }

  :global(.error-card) {
    color: color-mix(in srgb, var(--color-danger) 74%, var(--color-text-primary) 26%);
    border-color: color-mix(in srgb, var(--color-danger) 34%, var(--color-border) 66%);
  }

  @media (max-width: 640px) {
    .actions {
      width: 100%;
    }

    .actions :global(.ui-button) {
      width: 100%;
    }

    .item-list li {
      align-items: flex-start;
      flex-direction: column;
    }

    .item-list li :global(.ui-button) {
      width: 100%;
    }

    .usage-metric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
