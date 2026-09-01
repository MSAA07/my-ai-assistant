<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { Download, LogIn, ShieldAlert, Trash2, X } from '@lucide/svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import ConfirmModal from '../../lib/components/ui/ConfirmModal.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import SectionState from '../../lib/components/ui/SectionState.svelte';
  import Tabs from '../../lib/components/ui/Tabs.svelte';
  import { API_BASE } from '../../config.js';
  import { refreshSession } from '../../stores/auth.js';
  import { router } from '../../stores/router.js';
  import { toast } from '../../stores/toasts.js';
  import { buildSecurityAccessPath } from '../../lib/admin/securityAccess.js';
  import UsageBreakdownTable from './UsageBreakdownTable.svelte';

  export let userId;

  const dispatch = createEventDispatcher();
  const tabItems = [
    { value: 'profile', label: 'Profile' },
    { value: 'files', label: 'Files' },
    { value: 'sessions', label: 'Sessions' },
    { value: 'limits', label: 'Limits' },
    { value: 'usage', label: 'Usage' }
  ];
  const sectionKeys = tabItems.map((item) => item.value);
  const emptySectionState = () => ({ loading: false, error: '' });

  let activeTab = 'profile';
  let sectionState = Object.fromEntries(sectionKeys.map((key) => [key, emptySectionState()]));
  let user = null;
  let stats = null;
  let documents = [];
  let sessions = [];
  let usageDetail = null;
  let userLimit = null;
  let allowance = null;
  let limitsSaving = false;
  let limitsError = '';
  let supportReason = '';
  let actionBusy = '';
  let confirmConfig = null;
  let pendingConfirmAction = null;

  let form = { name: '', plan: 'free', role: 'user' };
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
  $: telegramUsage = user?.telegram || stats?.telegram || {};
  $: limitConsumed = allowance?.consumed || {};
  $: limitCaps = allowance?.caps || {};
  $: limitRemaining = allowance?.remaining || {};
  $: limitOverrides = allowance?.overrides || {};
  $: proposedDocumentOverride = parseNullableInteger(limitForm.documentCapOverride);
  $: proposedCostOverride = parseNullableNumber(limitForm.costCapUsdOverride);
  $: proposedTokenOverride = parseNullableInteger(limitForm.tokenCapOverride);
  $: loweringUserCaps = Boolean(allowance && (
    isLowering(proposedDocumentOverride, limitCaps.documentCap)
    || isLowering(proposedCostOverride, limitCaps.costCapUsd)
    || isLowering(proposedTokenOverride, limitCaps.tokenCap)
  ));
  $: proposedOverLimit = Boolean(allowance && (
    (proposedDocumentOverride !== null && Number(limitConsumed.documents || 0) >= proposedDocumentOverride)
    || (proposedCostOverride !== null && Number(limitConsumed.costUsd || 0) >= proposedCostOverride)
    || (proposedTokenOverride !== null && Number(limitConsumed.totalTokens || 0) >= proposedTokenOverride)
  ));

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
  const formatDate = (value) => value ? new Date(value).toLocaleString() : '-';

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

  function setSectionState(section, next) {
    sectionState = { ...sectionState, [section]: { ...sectionState[section], ...next } };
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

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function loadSection(section) {
    setSectionState(section, { loading: true, error: '' });
    try {
      if (section === 'profile') {
        const data = await fetchJson(`/api/admin/users/${userId}`);
        user = data.user;
        stats = data.stats;
        form = { name: user.name || '', plan: user.plan || 'free', role: user.role || 'user' };
      } else if (section === 'files') {
        const data = await fetchJson(`/api/admin/users/${userId}/files`);
        documents = data.documents || [];
      } else if (section === 'sessions') {
        const data = await fetchJson(`/api/admin/users/${userId}/sessions`);
        sessions = data.sessions || [];
      } else if (section === 'limits') {
        const data = await fetchJson(`/api/admin/users/${userId}/limits`);
        hydrateLimitForm(data.userLimit, data.allowance);
      } else if (section === 'usage') {
        usageDetail = await fetchJson(`/api/admin/usage/users/${userId}?granularity=day`);
      }
    } catch (error) {
      setSectionState(section, { error: error.message || `Failed to load ${section}` });
    } finally {
      setSectionState(section, { loading: false });
    }
  }

  function loadAllSections() {
    for (const section of sectionKeys) void loadSection(section);
  }

  async function runMutation({ key, path, method = 'POST', body, success, reload = [] }) {
    actionBusy = key;
    try {
      const data = await fetchJson(path, {
        method,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
      });
      toast.success(success);
      for (const section of reload) void loadSection(section);
      dispatch('updated');
      return data;
    } catch (error) {
      toast.error(error.message || 'Action failed');
      return null;
    } finally {
      actionBusy = '';
    }
  }

  function openConfirmation(config, action) {
    confirmConfig = config;
    pendingConfirmAction = action;
  }

  function closeConfirmation() {
    if (actionBusy) return;
    confirmConfig = null;
    pendingConfirmAction = null;
  }

  async function confirmPendingAction() {
    const action = pendingConfirmAction;
    if (!action) return;
    await action();
    closeConfirmation();
  }

  async function updateUser() {
    await runMutation({ key: 'update-user', path: `/api/admin/users/${userId}`, method: 'PATCH', body: form, success: 'User profile updated.', reload: ['profile'] });
  }

  async function suspendOrUnban() {
    const unban = Boolean(user?.banned);
    await runMutation({ key: 'suspend', path: `/api/admin/users/${userId}/${unban ? 'unsuspend' : 'suspend'}`, body: { reason: unban ? 'Admin restored access' : 'Admin suspended access' }, success: unban ? 'User access restored.' : 'User suspended.', reload: ['profile', 'sessions'] });
  }

  function requestBan() {
    openConfirmation({ title: `Ban ${user.email}?`, description: 'This immediately blocks sign-in and revokes the user’s sessions. It can be reversed later.', confirmLabel: 'Ban user', severity: 'danger' }, async () => {
      await runMutation({ key: 'ban', path: `/api/admin/users/${userId}/suspend`, body: { reason: 'User banned by admin' }, success: 'User banned.', reload: ['profile', 'sessions'] });
    });
  }

  function requestDeleteAccount() {
    openConfirmation({ title: 'Delete account', description: `Permanently delete ${user.email} and all associated data. This cannot be undone.`, confirmLabel: 'Delete account', severity: 'danger', typedConfirmation: { value: 'DELETE', prompt: 'Type', suffix: 'to permanently delete this account.' } }, async () => {
      const result = await runMutation({ key: 'delete-account', path: `/api/admin/users/${userId}`, method: 'DELETE', body: { confirmation: 'DELETE' }, success: 'Account deleted.' });
      if (result) dispatch('close');
    });
  }

  function requestEraseData() {
    openConfirmation({ title: 'Erase user data', description: `Erase ${user.email} using the account-deletion data path. This cannot be undone.`, confirmLabel: 'Erase data', severity: 'danger', typedConfirmation: { value: user.email, prompt: 'Type the exact email address', suffix: 'to erase this user’s data.' } }, async () => {
      const result = await runMutation({ key: 'erase-data', path: `/api/admin/users/${userId}/erase`, body: { confirmation: user.email }, success: 'User data erased.' });
      if (result) dispatch('close');
    });
  }

  async function startSupportLogin() {
    if (!supportReason.trim()) {
      toast.error('Enter a reason before starting support login.');
      return;
    }
    const result = await runMutation({ key: 'impersonate', path: `/api/admin/users/${userId}/impersonate`, body: { reason: supportReason.trim() }, success: `Now viewing as ${user.name || user.email}.` });
    if (!result) return;
    const restored = await refreshSession('impersonation_started');
    if (restored.error) {
      toast.error(restored.error.message || 'Support login started, but the session could not be refreshed.');
      return;
    }
    router.replace('/home');
    dispatch('close');
  }

  async function exportUserData() {
    actionBusy = 'export';
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/export`, { credentials: 'include' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to export user data');
      }
      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition') || '';
      const filename = disposition.match(/filename=([^;]+)/i)?.[1]?.replaceAll('"', '') || `user-${userId}.json`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('User data export downloaded.');
    } catch (error) {
      toast.error(error.message || 'Failed to export user data');
    } finally {
      actionBusy = '';
    }
  }

  function requestDocumentDelete(document) {
    openConfirmation({ title: 'Delete document', description: `Delete ${document.originalName}? Its stored file is removed before the database record.`, confirmLabel: 'Delete document', severity: 'danger' }, async () => {
      await runMutation({ key: `document-${document.id}`, path: `/api/admin/users/${userId}/files/${document.id}`, method: 'DELETE', success: 'Document deleted.', reload: ['profile', 'files', 'limits', 'usage'] });
    });
  }

  async function revokeSession(sessionId) {
    await runMutation({ key: `session-${sessionId}`, path: `/api/admin/users/${userId}/sessions/${sessionId}`, method: 'DELETE', success: 'Session revoked.', reload: ['profile', 'sessions'] });
  }

  function requestRevokeAllSessions() {
    openConfirmation({ title: 'Revoke all sessions', description: `Sign ${user?.email || 'this user'} out on every device?`, confirmLabel: 'Revoke all', severity: 'warning' }, async () => {
      await runMutation({ key: 'sessions-all', path: `/api/admin/users/${userId}/sessions`, method: 'DELETE', success: 'All user sessions revoked.', reload: ['profile', 'sessions'] });
    });
  }

  async function saveLimitOverrides() {
    limitsError = '';
    if ((loweringUserCaps || proposedOverLimit) && !limitForm.reason.trim()) {
      limitsError = 'Add a reason before lowering caps or placing this user over cap.';
      return;
    }
    const save = async () => {
      limitsSaving = true;
      const data = await runMutation({ key: 'limits-save', path: `/api/admin/users/${userId}/limits/overrides`, body: { documentCapOverride: limitForm.documentCapOverride === '' ? null : Number(limitForm.documentCapOverride), costCapUsdOverride: limitForm.costCapUsdOverride === '' ? null : Number(limitForm.costCapUsdOverride), tokenCapOverride: limitForm.tokenCapOverride === '' ? null : Number(limitForm.tokenCapOverride), reason: limitForm.reason.trim() || null }, success: 'Usage limit overrides saved.' });
      if (data) hydrateLimitForm(data.userLimit, data.allowance);
      limitsSaving = false;
    };
    if (loweringUserCaps || proposedOverLimit) {
      openConfirmation({ title: 'Save high-impact cap override', description: proposedOverLimit ? 'The user is already at or above a proposed cap. This change is audited.' : 'This lowers an active cap and is audited.', confirmLabel: 'Save override', severity: 'warning' }, save);
    } else await save();
  }

  function requestClearLimitOverrides() {
    openConfirmation({ title: 'Clear cap overrides', description: 'Restore the plan defaults for this user. This change is audited.', confirmLabel: 'Clear overrides', severity: 'warning' }, async () => {
      limitsSaving = true;
      const data = await runMutation({ key: 'limits-clear', path: `/api/admin/users/${userId}/limits/overrides/clear`, body: { fields: ['documentCapOverride', 'costCapUsdOverride', 'tokenCapOverride'], reason: limitForm.reason.trim() || null }, success: 'Usage limit overrides cleared.' });
      if (data) hydrateLimitForm(data.userLimit, data.allowance);
      limitsSaving = false;
    });
  }

  function handleEscape(event) {
    if (event.key === 'Escape' && !confirmConfig) dispatch('close');
  }

  onMount(() => {
    window.addEventListener('keydown', handleEscape);
    loadAllSections();
  });
  onDestroy(() => window.removeEventListener('keydown', handleEscape));
</script>

<div class="drawer-overlay" role="presentation" on:click|self={() => dispatch('close')}>
  <dialog open class="user-drawer" aria-labelledby="user-detail-heading">
    <header class="drawer-header">
      <div><span class="eyebrow">User management</span><h2 id="user-detail-heading">{user?.name || user?.email || 'User detail'}</h2>{#if user}<p>{user.email}</p>{/if}</div>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Close user detail" on:click={() => dispatch('close')}><svelte:fragment slot="icon"><X aria-hidden="true" /></svelte:fragment></Button>
    </header>

    <Tabs className="user-detail-tabs" items={tabItems} value={activeTab} ariaLabel="User detail sections" mobileScrollable on:change={(event) => (activeTab = event.detail.value)} />

    <div class="drawer-content">
      {#if sectionState[activeTab].loading}
        <SectionState message={`Loading ${activeTab}...`} />
      {:else if sectionState[activeTab].error}
        <SectionState error message={sectionState[activeTab].error} retry={() => loadSection(activeTab)} />
      {:else if activeTab === 'profile' && user}
        <div class="panel-stack">
          <Card class="detail-card" variant="base" padding="md">
            <header class="card-header"><h3>Profile</h3><Badge tone={user.banned ? 'danger' : 'success'} size="sm">{user.banned ? 'Banned' : 'Active'}</Badge></header>
            <div class="field-grid"><FieldShell label="Name" forId="account-name"><input id="account-name" bind:value={form.name} /></FieldShell><FieldShell label="Plan" forId="account-plan"><select id="account-plan" bind:value={form.plan}><option value="free">Free</option><option value="premium">Premium</option></select></FieldShell><FieldShell label="Role" forId="account-role"><select id="account-role" bind:value={form.role}><option value="user">User</option><option value="admin">Admin</option></select></FieldShell></div>
            <div class="actions"><Button type="button" variant="primary" size="sm" loading={actionBusy === 'update-user'} on:click={updateUser}>Save changes</Button><Button type="button" variant={user.banned ? 'success' : 'warning'} size="sm" loading={actionBusy === 'suspend'} on:click={suspendOrUnban}>{user.banned ? 'Restore access' : 'Suspend now'}</Button></div>
          </Card>

          <Card class="detail-card" variant="base" padding="md"><header class="card-header"><h3>Account activity</h3><Button type="button" variant="secondary" size="sm" on:click={() => router.navigate(buildSecurityAccessPath(userId, { view: 'sessions' }))}>View this user’s activity</Button></header><dl class="stats-list"><div><dt>Documents</dt><dd>{stats?.documents ?? 0}</dd></div><div><dt>Storage</dt><dd>{formatBytes(user.storageUsed)}</dd></div><div><dt>Active sessions</dt><dd>{stats?.sessions ?? 0}</dd></div><div><dt>Exam attempts</dt><dd>{stats?.examAttempts ?? 0}</dd></div><div><dt>Flashcard progress</dt><dd>{stats?.flashcardProgress ?? 0}</dd></div><div><dt>Last active</dt><dd>{formatDate(user.lastActive)}</dd></div><div><dt>Telegram</dt><dd>{telegramUsage.connected ? 'Connected' : 'Not connected'}</dd></div><div><dt>Telegram sends</dt><dd>{formatNumber(telegramUsage.flashcardSendCount)} flashcards / {formatNumber(telegramUsage.examSendCount)} exams</dd></div></dl></Card>

          <Card class="detail-card support-card" variant="base" padding="md"><header class="card-header"><div><h3>Support login</h3><p>Admin-only, audited, and capped at 60 minutes.</p></div><LogIn aria-hidden="true" /></header><FieldShell label="Reason" forId="support-login-reason" required><textarea id="support-login-reason" rows="3" bind:value={supportReason} placeholder="Why do you need to view this account?"></textarea></FieldShell><Button type="button" variant="primary" size="sm" loading={actionBusy === 'impersonate'} on:click={startSupportLogin}>Log in as user</Button></Card>

          <Card class="detail-card danger-zone" variant="base" padding="md"><header class="card-header"><div><h3>Data & privacy</h3><p>Each action has a confirmation level proportional to its impact.</p></div><ShieldAlert aria-hidden="true" /></header><div class="privacy-actions"><div><span><strong>Export data</strong><small>Download a structured JSON copy.</small></span><Button type="button" variant="secondary" size="sm" loading={actionBusy === 'export'} on:click={exportUserData}><svelte:fragment slot="icon"><Download /></svelte:fragment>Export</Button></div><div><span><strong>Ban account</strong><small>Simple confirmation; reversible.</small></span><Button type="button" variant="warning" size="sm" on:click={requestBan}>Ban</Button></div><div><span><strong>Delete account</strong><small>Requires typing DELETE.</small></span><Button type="button" variant="danger" size="sm" on:click={requestDeleteAccount}><svelte:fragment slot="icon"><Trash2 /></svelte:fragment>Delete</Button></div><div><span><strong>Erase data</strong><small>Requires the exact user email.</small></span><Button type="button" variant="danger" size="sm" on:click={requestEraseData}>Erase</Button></div></div></Card>
        </div>
      {:else if activeTab === 'files'}
        <Card class="detail-card" variant="base" padding="md"><header class="card-header"><h3>User files</h3><Badge tone="neutral" size="sm">{documents.length} total</Badge></header>{#if documents.length === 0}<p class="muted">No documents uploaded.</p>{:else}<ul class="item-list">{#each documents as document}<li><span><strong>{document.originalName}</strong><small>{formatBytes(document.fileSize)} · {formatDate(document.uploadDate)}</small></span><Button type="button" variant="danger" size="sm" loading={actionBusy === `document-${document.id}`} on:click={() => requestDocumentDelete(document)}>Delete</Button></li>{/each}</ul>{/if}</Card>
      {:else if activeTab === 'sessions'}
        <Card class="detail-card" variant="base" padding="md"><header class="card-header"><h3>Active sessions</h3><Button type="button" variant="danger" size="sm" disabled={sessions.length === 0} on:click={requestRevokeAllSessions}>Revoke all</Button></header>{#if sessions.length === 0}<p class="muted">No active sessions.</p>{:else}<ul class="item-list">{#each sessions as session}<li><span><strong>{session.ipAddress || 'Unknown IP'}</strong><small>Expires {formatDate(session.expiresAt)}{session.userAgent ? ` · ${session.userAgent}` : ''}</small></span><Button type="button" variant="danger" size="sm" loading={actionBusy === `session-${session.id}`} on:click={() => revokeSession(session.id)}>Revoke</Button></li>{/each}</ul>{/if}</Card>
      {:else if activeTab === 'limits'}
        <div class="panel-stack"><Card class="detail-card" variant="base" padding="md"><header class="card-header"><h3>Usage limits</h3><Badge tone={limitOverrides.overrideBy ? 'warning' : 'neutral'} size="sm">{limitOverrides.overrideBy ? 'Override active' : 'Default caps'}</Badge></header><div class="usage-metric-grid"><div><span>Consumed USD</span><strong>{formatUsd(limitConsumed.costUsd)}</strong></div><div><span>Cost cap</span><strong>{formatCap(limitCaps.costCapUsd, formatUsd)}</strong></div><div><span>Remaining USD</span><strong>{formatCap(limitRemaining.costUsd, formatUsd)}</strong></div><div><span>Documents</span><strong>{formatNumber(limitConsumed.documents)}</strong></div><div><span>Document cap</span><strong>{formatCap(limitCaps.documentCap)}</strong></div><div><span>Remaining docs</span><strong>{formatCap(limitRemaining.documents)}</strong></div><div><span>Total tokens</span><strong>{formatNumber(limitConsumed.totalTokens)}</strong></div><div><span>Token cap</span><strong>{formatCap(limitCaps.tokenCap)}</strong></div><div><span>Remaining tokens</span><strong>{formatCap(limitRemaining.tokens)}</strong></div></div></Card><Card class="detail-card" variant="base" padding="md"><header class="card-header"><h3>Cap overrides</h3>{#if loweringUserCaps || proposedOverLimit}<Badge tone="warning" size="sm">Reason required</Badge>{/if}</header><div class="field-grid"><FieldShell label="Document cap override" forId="user-document-cap"><input id="user-document-cap" type="number" min="0" bind:value={limitForm.documentCapOverride} placeholder="Use default" /></FieldShell><FieldShell label="USD cost cap override" forId="user-cost-cap"><input id="user-cost-cap" type="number" min="0" step="0.0001" bind:value={limitForm.costCapUsdOverride} placeholder="Use default" /></FieldShell><FieldShell label="Token cap override" forId="user-token-cap"><input id="user-token-cap" type="number" min="0" bind:value={limitForm.tokenCapOverride} placeholder="Use default" /></FieldShell><FieldShell label="Reason" forId="user-limit-reason"><textarea id="user-limit-reason" rows="3" bind:value={limitForm.reason} placeholder="Required for high-impact changes"></textarea></FieldShell></div>{#if limitsError}<Card class="error-card" variant="soft" border="strong" padding="sm">{limitsError}</Card>{/if}<div class="actions"><Button type="button" variant="primary" size="sm" loading={limitsSaving} on:click={saveLimitOverrides}>Save overrides</Button><Button type="button" variant="secondary" size="sm" disabled={limitsSaving} on:click={requestClearLimitOverrides}>Clear overrides</Button></div></Card></div>
      {:else if activeTab === 'usage'}
        <div class="panel-stack"><Card class="detail-card" variant="base" padding="md"><header class="card-header"><h3>Usage & cost</h3><Badge tone="neutral" size="sm">Daily</Badge></header><div class="usage-metric-grid"><div><span>USD cost</span><strong>{formatUsd(usageTotals.costUsd)}</strong></div><div><span>SAR approx.</span><strong>{formatSar(usageTotals.costSar)}</strong></div><div><span>Total tokens</span><strong>{formatNumber(usageTotals.totalTokens)}</strong></div><div><span>Input tokens</span><strong>{formatNumber(usageTotals.inputTokens)}</strong></div><div><span>Output tokens</span><strong>{formatNumber(usageTotals.outputTokens)}</strong></div><div><span>Events</span><strong>{formatNumber(usageTotals.events)}</strong></div></div></Card><UsageBreakdownTable title="Documents" rows={usageDocuments} type="documents" nameKey="document" idKey="documentId" compact /><UsageBreakdownTable title="Features" rows={usageFeatures} type="features" labelKey="featureKey" compact /><UsageBreakdownTable title="Models" rows={usageModels} type="models" labelKey="model" compact /><DataSurface title="Daily usage" description="Ledger totals by day for this user." tableMinWidth="760px" compact><svelte:fragment slot="table">{#if usageSeries.length > 0}<table class="ui-data-table"><thead><tr><th>Bucket</th><th>Events</th><th>Input</th><th>Output</th><th>Total</th><th>USD</th><th>SAR</th></tr></thead><tbody>{#each usageSeries as item}<tr><td><strong>{formatDate(item.bucketStart)}</strong></td><td>{formatNumber(item.events)}</td><td>{formatNumber(item.inputTokens)}</td><td>{formatNumber(item.outputTokens)}</td><td>{formatNumber(item.totalTokens)}</td><td>{formatUsd(item.costUsd)}</td><td>{formatSar(item.costSar)}</td></tr>{/each}</tbody></table>{:else}<p class="ui-data-state-note">No model usage recorded for this user.</p>{/if}</svelte:fragment></DataSurface></div>
      {/if}
    </div>
  </dialog>
</div>

{#if confirmConfig}
  <ConfirmModal open title={confirmConfig.title} description={confirmConfig.description} confirmLabel={confirmConfig.confirmLabel} severity={confirmConfig.severity} typedConfirmation={confirmConfig.typedConfirmation} busy={Boolean(actionBusy)} on:cancel={closeConfirmation} on:confirm={confirmPendingAction} />
{/if}

<style>
  .drawer-overlay { position: fixed; inset: 0; z-index: 900; display: flex; justify-content: flex-end; background: var(--color-backdrop-strong); }
  .user-drawer { position: relative; inset: auto; width: min(760px, 100vw); max-width: none; height: 100dvh; max-height: none; margin: 0; padding: 0; display: grid; grid-template-rows: auto auto minmax(0, 1fr); background: var(--ui-surface-overlay); color: var(--ui-text-primary); border: 0; border-inline-start: 1px solid var(--ui-border-strong); box-shadow: var(--ui-shadow-lg); }
  .drawer-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ui-space-3); padding: var(--ui-space-4); border-bottom: 1px solid var(--ui-divider); }
  .drawer-header h2, h3 { margin: 0; color: var(--ui-text-primary); }
  .drawer-header h2 { font-size: var(--ui-type-title-sm); }
  .drawer-header p, .card-header p { margin: 0.2rem 0 0; color: var(--ui-text-secondary); font-size: var(--ui-type-label); }
  .eyebrow { color: var(--ui-text-muted); font-size: var(--ui-type-label); text-transform: uppercase; letter-spacing: 0.08em; }
  :global(.user-detail-tabs) { padding: var(--ui-space-3) var(--ui-space-4) 0; }
  .drawer-content { overflow-y: auto; padding: var(--ui-space-4); }
  .panel-stack { display: grid; gap: var(--ui-space-3); }
  :global(.detail-card) { gap: var(--ui-space-3); }
  .card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ui-space-2); }
  .card-header :global(svg) { width: 1.1rem; height: 1.1rem; color: var(--ui-text-muted); }
  .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--ui-space-3); }
  .actions { display: flex; flex-wrap: wrap; gap: var(--ui-space-2); }
  .stats-list { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--ui-space-2); }
  .stats-list div, .usage-metric-grid div { display: grid; gap: 0.15rem; min-width: 0; padding: var(--ui-space-2); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-sm); background: var(--ui-surface-secondary); }
  .stats-list dt, .usage-metric-grid span { color: var(--ui-text-muted); font-size: var(--ui-type-label); text-transform: uppercase; letter-spacing: 0.05em; }
  .stats-list dd { margin: 0; color: var(--ui-text-primary); font-size: var(--ui-type-body-sm); overflow-wrap: anywhere; }
  textarea { resize: vertical; }
  :global(.support-card) { border-color: color-mix(in srgb, var(--ui-accent-info) 28%, var(--ui-border-default) 72%); }
  :global(.danger-zone) { border-color: color-mix(in srgb, var(--ui-accent-danger) 30%, var(--ui-border-default) 70%); }
  .privacy-actions { display: grid; gap: var(--ui-space-2); }
  .privacy-actions > div, .item-list li { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-3); padding: var(--ui-space-2); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-sm); background: var(--ui-surface-secondary); }
  .privacy-actions span, .item-list span { display: grid; gap: 0.12rem; min-width: 0; }
  .privacy-actions small, .item-list small { color: var(--ui-text-secondary); font-size: var(--ui-type-label); overflow-wrap: anywhere; }
  .item-list { list-style: none; display: grid; gap: var(--ui-space-2); margin: 0; padding: 0; }
  .item-list strong { color: var(--ui-text-primary); overflow-wrap: anywhere; }
  .usage-metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--ui-space-2); }
  .usage-metric-grid strong { color: var(--ui-text-primary); font-size: var(--ui-type-body-sm); overflow-wrap: anywhere; }
  .muted { margin: 0; color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
  :global(.error-card) { color: color-mix(in srgb, var(--ui-accent-danger) 78%, var(--ui-text-primary) 22%); }
  @media (max-width: 640px) { .field-grid, .stats-list, .usage-metric-grid { grid-template-columns: 1fr; } .drawer-content { padding: var(--ui-space-3); } .privacy-actions > div, .item-list li { align-items: stretch; flex-direction: column; } .privacy-actions :global(.ui-button), .item-list :global(.ui-button) { width: 100%; } }
</style>
