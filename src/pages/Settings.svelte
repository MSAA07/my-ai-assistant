<script>
  import { onMount } from 'svelte';
  import { CreditCard, ExternalLink, Eye, EyeOff, KeyRound, Mail, RefreshCw, Send, Unlink, User, X } from '@lucide/svelte';
  import PageLayout from '../lib/components/layout/PageLayout.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import FieldShell from '../lib/components/ui/FieldShell.svelte';
  import Section from '../lib/components/ui/Section.svelte';
  import SettingsPanelSkeleton from '../lib/components/ui/SettingsPanelSkeleton.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import {
    changePassword,
    listSessions,
    revokeSession,
    revokeOtherSessions,
    session,
    signOut,
  } from '../stores/auth.js';
  import {
    createTelegramLinkToken,
    disconnectTelegram,
    getTelegramStatus
  } from '../lib/api/studyHub.js';
  import { t } from '../lib/i18n/t.js';
  import { validateConfirmPassword, validatePassword } from '../components/auth/validation.js';

  // ── Account ──────────────────────────────────────────────────────────
  let loggingOut = false;

  $: userName = $session?.user?.name ?? t('settings.account.anonymous');
  $: userEmail = $session?.user?.email ?? t('settings.account.noEmail');
  $: plan = $session?.user?.plan ?? 'free';
  $: planLabel = plan === 'pro' || plan === 'premium' ? t('nav.proBadge') : t('nav.freeBadge');
  $: userInitial = (userName?.[0] ?? '?').toUpperCase();

  async function handleLogout() {
    loggingOut = true;
    try {
      await signOut();
    } finally {
      loggingOut = false;
    }
  }

  // ── Security — change password ────────────────────────────────────────
  let changingPassword = false;
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let showCurrentPassword = false;
  let showNewPassword = false;
  let showConfirmPassword = false;
  let passwordModalOpen = false;
  let passwordFeedback = '';
  let passwordFeedbackTone = 'info';
  let passwordTouched = {
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  };

  $: passwordErrors = {
    currentPassword: passwordTouched.currentPassword && !currentPassword ? t('auth.validation.currentPasswordRequired') : '',
    newPassword: passwordTouched.newPassword ? validatePassword(newPassword, t) : '',
    confirmPassword: passwordTouched.confirmPassword ? validateConfirmPassword(newPassword, confirmPassword, t) : '',
  };
  $: passwordHasErrors = Boolean(passwordErrors.currentPassword || passwordErrors.newPassword || passwordErrors.confirmPassword);
  $: currentPasswordInputType = showCurrentPassword ? 'text' : 'password';
  $: newPasswordInputType = showNewPassword ? 'text' : 'password';
  $: confirmPasswordInputType = showConfirmPassword ? 'text' : 'password';

  function resetPasswordForm() {
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;
    passwordFeedback = '';
    passwordTouched = { currentPassword: false, newPassword: false, confirmPassword: false };
  }

  function openPasswordModal() {
    resetPasswordForm();
    passwordModalOpen = true;
  }

  function closePasswordModal() {
    if (changingPassword) return;
    passwordModalOpen = false;
    resetPasswordForm();
  }

  async function handleChangePassword() {
    if (changingPassword) return;

    passwordTouched = { currentPassword: true, newPassword: true, confirmPassword: true };
    passwordFeedback = '';

    const nextErrors = {
      currentPassword: currentPassword ? '' : t('auth.validation.currentPasswordRequired'),
      newPassword: validatePassword(newPassword, t),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword, t),
    };

    if (Object.values(nextErrors).some(Boolean)) return;

    changingPassword = true;
    const result = await changePassword(currentPassword, newPassword, { revokeOtherSessions: false });
    changingPassword = false;

    if (result.error) {
      passwordFeedbackTone = 'error';
      passwordFeedback = result.error.message || t('auth.changePassword.errors.failed');
      return;
    }

    passwordFeedbackTone = 'success';
    passwordFeedback = t('auth.changePassword.success');
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    passwordTouched = { currentPassword: false, newPassword: false, confirmPassword: false };
  }

  // ── Telegram ─────────────────────────────────────────────────────────
  let telegramStatus = null;
  let telegramLoading = true;
  let telegramBusy = false;
  let telegramDisconnecting = false;
  let telegramError = '';
  let telegramFeedback = '';
  let telegramDeepLink = '';

  $: telegramConnected = Boolean(telegramStatus?.connected);
  $: telegramBotUsername = telegramStatus?.botUsername || 'studymaxing_admin_bot';

  function formatOptionalDate(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleString();
  }

  async function loadTelegramStatus({ background = false } = {}) {
    if (!background) {
      telegramLoading = true;
    }
    telegramError = '';

    try {
      telegramStatus = await getTelegramStatus();
      if (telegramStatus?.connected) {
        telegramDeepLink = '';
        telegramFeedback = '';
      }
    } catch (error) {
      telegramError = error?.message || t('settings.telegram.errors.status');
    } finally {
      telegramLoading = false;
    }
  }

  async function handleTelegramConnect() {
    if (telegramBusy) return;
    telegramBusy = true;
    telegramError = '';
    telegramFeedback = '';

    try {
      const response = await createTelegramLinkToken();
      telegramDeepLink = response.deepLink || '';
      telegramFeedback = t('settings.telegram.linkCreated');
      if (telegramDeepLink) {
        window.open(telegramDeepLink, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      telegramError = error?.message || t('settings.telegram.errors.link');
    } finally {
      telegramBusy = false;
    }
  }

  async function handleTelegramDisconnect() {
    if (telegramDisconnecting) return;
    telegramDisconnecting = true;
    telegramError = '';
    telegramFeedback = '';

    try {
      await disconnectTelegram();
      telegramDeepLink = '';
      telegramFeedback = t('settings.telegram.disconnected');
      await loadTelegramStatus({ background: true });
    } catch (error) {
      telegramError = error?.message || t('settings.telegram.errors.disconnect');
    } finally {
      telegramDisconnecting = false;
    }
  }

  // ── Sessions ──────────────────────────────────────────────────────────
  let sessions = [];
  let sessionsLoading = true;
  let sessionsError = '';
  let revokingToken = '';
  let revokingAll = false;
  let revokeAllFeedback = '';
  let revokeAllFeedbackTone = 'info';

  $: currentToken = $session?.session?.token ?? '';

  function parseDevice(userAgent = '') {
    if (!userAgent) return t('settings.sessions.unknownDevice');
    const ua = userAgent;
    let browser = '';
    let os = '';

    if (/Edg\//.test(ua)) browser = 'Edge';
    else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
    else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome';
    else if (/Firefox\//.test(ua)) browser = 'Firefox';
    else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
    else if (/MSIE|Trident/.test(ua)) browser = 'IE';

    if (/Windows NT/.test(ua)) os = 'Windows';
    else if (/iPhone/.test(ua)) os = 'iPhone';
    else if (/iPad/.test(ua)) os = 'iPad';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/Mac OS X/.test(ua)) os = 'macOS';
    else if (/Linux/.test(ua)) os = 'Linux';

    if (browser && os) return `${browser} on ${os}`;
    return browser || os || t('settings.sessions.unknownDevice');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function loadSessions() {
    sessionsLoading = true;
    sessionsError = '';
    const result = await listSessions();
    sessionsLoading = false;
    if (result.error) {
      sessionsError = t('settings.sessions.errors.load');
      return;
    }
    sessions = Array.isArray(result.data) ? result.data : [];
  }

  async function handleRevokeSession(token) {
    if (revokingToken) return;
    revokingToken = token;
    const result = await revokeSession(token);
    revokingToken = '';
    if (result.error) {
      sessionsError = t('settings.sessions.errors.revoke');
      return;
    }
    sessions = sessions.filter((s) => s.token !== token);
  }

  async function handleRevokeOthers() {
    if (revokingAll) return;
    revokingAll = true;
    revokeAllFeedback = '';
    const result = await revokeOtherSessions();
    revokingAll = false;
    if (result.error) {
      revokeAllFeedbackTone = 'error';
      revokeAllFeedback = t('settings.sessions.errors.revokeOthers');
      return;
    }
    revokeAllFeedbackTone = 'success';
    revokeAllFeedback = t('settings.sessions.revokeOthersSuccess');
    sessions = sessions.filter((s) => s.token === currentToken);
  }

  $: otherSessions = sessions.filter((s) => s.token !== currentToken);
  $: hasOtherSessions = otherSessions.length > 0;

  onMount(() => {
    loadSessions();
    loadTelegramStatus();
  });
</script>

{#if !$session}
  <SettingsPanelSkeleton />
{:else}
  <PageLayout class="settings-page" width="wide">
    <PageHeader
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
    />

    <div class="settings-grid">

      <!-- Account -->
      <Section
        id="account"
        className="settings-card settings-card--account settings-card--summary"
        title={t('settings.account.title')}
        description={t('settings.account.description')}
      >
        <div slot="actions">
          <StatusBadge status={plan === 'free' ? 'info' : 'ready'}>{planLabel}</StatusBadge>
        </div>

        <div class="account-row">
          <div class="account-avatar" aria-hidden="true">{userInitial}</div>
          <div class="account-info">
            <p class="account-name">{userName}</p>
            <p class="account-email">{userEmail}</p>
          </div>
          <div class="account-actions">
            <Button
              type="button"
              variant="danger"
              size="sm"
              on:click={handleLogout}
              loading={loggingOut}
            >
              {loggingOut ? t('settings.account.actions.loggingOut') : t('settings.account.actions.logout')}
            </Button>
          </div>
        </div>
      </Section>

      <!-- Telegram -->
      <Section
        id="telegram"
        className="settings-card settings-card--telegram settings-card--summary"
        title={t('settings.telegram.title')}
        description={t('settings.telegram.description')}
      >
        {#if telegramLoading}
          <div class="telegram-loading" aria-busy="true">
            <span class="sessions-spinner" aria-hidden="true"></span>
            <p class="helper">{t('settings.telegram.loading')}</p>
          </div>
        {:else}
          <div class="telegram-block">
            <div class="telegram-status-row">
              <div class="telegram-copy">
                <StatusBadge
                  status={telegramConnected ? 'ready' : 'info'}
                  label={telegramConnected ? t('settings.telegram.connected') : t('settings.telegram.disconnectedStatus')}
                />
                <p class="helper">
                  {#if telegramConnected}
                    {t('settings.telegram.connectedMeta', {
                      date: formatOptionalDate(telegramStatus?.connectedAt) || '-'
                    })}
                  {:else}
                    {t('settings.telegram.connectHelper', { bot: `@${telegramBotUsername}` })}
                  {/if}
                </p>
                {#if telegramStatus?.lastSendAt}
                  <p class="helper">{t('settings.telegram.lastSend', { date: formatOptionalDate(telegramStatus.lastSendAt) })}</p>
                {/if}
              </div>

              <div class="telegram-actions">
                {#if telegramConnected}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    loading={telegramDisconnecting}
                    disabled={telegramDisconnecting}
                    on:click={handleTelegramDisconnect}
                  >
                    <span slot="icon" aria-hidden="true"><Unlink /></span>
                    {telegramDisconnecting ? t('settings.telegram.disconnecting') : t('settings.telegram.disconnect')}
                  </Button>
                {:else}
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={telegramBusy}
                    disabled={telegramBusy}
                    on:click={handleTelegramConnect}
                  >
                    <span slot="icon" aria-hidden="true"><Send /></span>
                    {telegramBusy ? t('settings.telegram.creatingLink') : t('settings.telegram.connect')}
                  </Button>
                {/if}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={telegramLoading}
                  on:click={() => loadTelegramStatus({ background: true })}
                >
                  <span slot="icon" aria-hidden="true"><RefreshCw /></span>
                  {t('settings.telegram.refresh')}
                </Button>
              </div>
            </div>

            {#if telegramDeepLink}
              <div class="telegram-link-row">
                <a href={telegramDeepLink} target="_blank" rel="noreferrer" class="telegram-link">
                  <ExternalLink aria-hidden="true" />
                  {t('settings.telegram.openTelegram')}
                </a>
                <p class="helper">{t('settings.telegram.afterStart')}</p>
              </div>
            {/if}

            {#if telegramError}
              <p class="telegram-feedback telegram-feedback--error" role="alert">{telegramError}</p>
            {:else if telegramFeedback}
              <p class="telegram-feedback telegram-feedback--success" role="status">{telegramFeedback}</p>
            {/if}
          </div>
        {/if}
      </Section>

      <!-- Security -->
      <Section
        id="security"
        className="settings-card settings-card--wide"
        title={t('settings.security.title')}
        description={t('settings.security.description')}
      >
        <div class="account-information-layout">
          <div class="account-details-list" aria-label={t('settings.security.detailsLabel')}>
            <div class="account-detail-row">
              <span class="account-detail-icon" aria-hidden="true"><User /></span>
              <div>
                <p class="account-detail-label">{t('settings.security.nameLabel')}</p>
                <p class="account-detail-value">{userName}</p>
              </div>
            </div>

            <div class="account-detail-row">
              <span class="account-detail-icon" aria-hidden="true"><Mail /></span>
              <div>
                <p class="account-detail-label">{t('settings.security.emailLabel')}</p>
                <p class="account-detail-value">{userEmail}</p>
              </div>
            </div>

            <div class="account-detail-row">
              <span class="account-detail-icon" aria-hidden="true"><CreditCard /></span>
              <div>
                <p class="account-detail-label">{t('settings.security.planLabel')}</p>
                <p class="account-detail-value">{planLabel}</p>
              </div>
            </div>
          </div>

          <aside class="password-summary" aria-label={t('settings.security.passwordTitle')}>
            <span class="password-summary__icon" aria-hidden="true"><KeyRound /></span>
            <div class="password-summary__copy">
              <h3>{t('settings.security.passwordTitle')}</h3>
              <p>{t('settings.security.passwordDescription')}</p>
            </div>
            <Button type="button" variant="secondary" size="sm" on:click={openPasswordModal}>
              {t('settings.security.changePassword')}
            </Button>
          </aside>
        </div>
      </Section>

      <!-- Sessions -->
      <Section
        id="sessions"
        className="settings-card settings-card--wide"
        title={t('settings.sessions.title')}
        description={t('settings.sessions.description')}
      >
        {#if sessionsLoading}
          <div class="sessions-loading" aria-busy="true">
            <span class="sessions-spinner" aria-hidden="true"></span>
          </div>
        {:else if sessionsError}
          <p class="sessions-error" role="alert">{sessionsError}</p>
        {:else}
          <ul class="sessions-list" aria-label={t('settings.sessions.title')}>
            {#each sessions as s (s.token)}
              {@const isCurrent = s.token === currentToken}
              <li class="session-row" class:session-row--current={isCurrent}>
                <div class="session-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </div>
                <div class="session-info">
                  <p class="session-device">
                    {parseDevice(s.userAgent)}
                    {#if isCurrent}
                      <span class="session-current-badge">{t('settings.sessions.current')}</span>
                    {/if}
                  </p>
                  {#if s.createdAt}
                    <p class="session-meta">{t('settings.sessions.signedIn')} {formatDate(s.createdAt)}</p>
                  {/if}
                </div>
                {#if !isCurrent}
                  <div class="session-action">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      loading={revokingToken === s.token}
                      disabled={!!revokingToken}
                      on:click={() => handleRevokeSession(s.token)}
                    >
                      {revokingToken === s.token ? t('settings.sessions.revoking') : t('settings.sessions.revoke')}
                    </Button>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>

          {#if revokeAllFeedback}
            <p class="sessions-feedback sessions-feedback--{revokeAllFeedbackTone}" role="status">
              {revokeAllFeedback}
            </p>
          {/if}

          <div class="sessions-footer">
            {#if hasOtherSessions}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={revokingAll}
                disabled={revokingAll}
                on:click={handleRevokeOthers}
              >
                {revokingAll ? t('settings.sessions.revokeOthersLoading') : t('settings.sessions.revokeOthers')}
              </Button>
            {:else if !sessionsLoading}
              <p class="helper">{t('settings.sessions.noOtherSessions')}</p>
            {/if}
          </div>
        {/if}
      </Section>

    </div>
  </PageLayout>

  {#if passwordModalOpen}
    <div class="settings-modal-backdrop" role="presentation" on:click={closePasswordModal}>
      <div
        class="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        tabindex="-1"
        on:click|stopPropagation
        on:keydown|stopPropagation
      >
        <div class="settings-modal__header">
          <div>
            <p class="settings-modal__eyebrow">{t('settings.security.passwordEyebrow')}</p>
            <h2 id="change-password-title">{t('settings.security.changePassword')}</h2>
          </div>
          <button
            type="button"
            class="settings-modal__close"
            aria-label={t('common.close')}
            disabled={changingPassword}
            on:click={closePasswordModal}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div class="password-form">
          <div class="security-form-copy">
            <p>{t('settings.security.formDescription')}</p>
          </div>

          <FieldShell
            label={t('auth.changePassword.fields.currentPassword')}
            forId="current-password"
            required
            error={passwordErrors.currentPassword}
          >
            <div class="password-input-wrap">
              <input
                id="current-password"
                type={currentPasswordInputType}
                bind:value={currentPassword}
                autocomplete="current-password"
                placeholder={t('auth.changePassword.placeholders.currentPassword')}
                aria-invalid={passwordErrors.currentPassword ? 'true' : 'false'}
                on:blur={() => (passwordTouched = { ...passwordTouched, currentPassword: true })}
              />
              <button
                type="button"
                class="password-visibility"
                aria-label={showCurrentPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')}
                aria-pressed={showCurrentPassword}
                on:click={() => (showCurrentPassword = !showCurrentPassword)}
              >
                {#if showCurrentPassword}<EyeOff />{:else}<Eye />{/if}
              </button>
            </div>
          </FieldShell>

          <FieldShell
            label={t('auth.changePassword.fields.newPassword')}
            forId="new-password"
            required
            error={passwordErrors.newPassword}
            hint={t('auth.validation.passwordHint')}
          >
            <div class="password-input-wrap">
              <input
                id="new-password"
                type={newPasswordInputType}
                bind:value={newPassword}
                autocomplete="new-password"
                placeholder={t('auth.changePassword.placeholders.newPassword')}
                aria-invalid={passwordErrors.newPassword ? 'true' : 'false'}
                on:blur={() => (passwordTouched = { ...passwordTouched, newPassword: true })}
              />
              <button
                type="button"
                class="password-visibility"
                aria-label={showNewPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')}
                aria-pressed={showNewPassword}
                on:click={() => (showNewPassword = !showNewPassword)}
              >
                {#if showNewPassword}<EyeOff />{:else}<Eye />{/if}
              </button>
            </div>
          </FieldShell>

          <FieldShell
            label={t('auth.fields.confirmPassword')}
            forId="confirm-new-password"
            required
            error={passwordErrors.confirmPassword}
          >
            <div class="password-input-wrap">
              <input
                id="confirm-new-password"
                type={confirmPasswordInputType}
                bind:value={confirmPassword}
                autocomplete="new-password"
                placeholder={t('auth.changePassword.placeholders.confirmPassword')}
                aria-invalid={passwordErrors.confirmPassword ? 'true' : 'false'}
                on:blur={() => (passwordTouched = { ...passwordTouched, confirmPassword: true })}
              />
              <button
                type="button"
                class="password-visibility"
                aria-label={showConfirmPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')}
                aria-pressed={showConfirmPassword}
                on:click={() => (showConfirmPassword = !showConfirmPassword)}
              >
                {#if showConfirmPassword}<EyeOff />{:else}<Eye />{/if}
              </button>
            </div>
          </FieldShell>

          {#if passwordFeedback}
            <p class="password-feedback password-feedback--{passwordFeedbackTone}" role="status">
              {passwordFeedback}
            </p>
          {/if}

          <div class="password-actions">
            <Button
              type="button"
              variant="primary"
              loading={changingPassword}
              disabled={changingPassword || passwordHasErrors}
              on:click={handleChangePassword}
            >
              {changingPassword ? t('auth.changePassword.actions.loading') : t('auth.changePassword.actions.submit')}
            </Button>
            <p class="helper">{t('auth.changePassword.sessionNote')}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  :global(.settings-page) {
    display: grid;
    gap: var(--study-flow-page-gap);
    min-width: 0;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ui-space-4);
    align-items: stretch;
    min-width: 0;
  }

  :global(.settings-card.ui-section) {
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--ui-text-primary) 4%, transparent) 0%, transparent 38%),
      linear-gradient(145deg, color-mix(in srgb, var(--ui-surface-card) 92%, var(--ui-surface-secondary) 8%) 0%, var(--ui-surface-card) 100%);
    border-color: color-mix(in srgb, var(--ui-text-primary) 8%, var(--ui-border-default) 92%);
    box-shadow:
      0 1px 0 color-mix(in srgb, var(--ui-text-primary) 4%, transparent) inset,
      var(--ui-shadow-1);
  }

  :global(.settings-card--wide.ui-section) {
    grid-column: 1 / -1;
  }

  :global(.settings-card--summary.ui-section) {
    height: 100%;
  }

  :global(.settings-card--summary .ui-section__body) {
    display: flex;
    flex-direction: column;
  }

  /* Account row */
  .account-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    flex: 1;
  }

  .account-avatar {
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--ui-accent-primary) 18%, var(--ui-surface-secondary) 82%);
    color: var(--ui-text-primary);
    font-size: 0.9rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0;
    user-select: none;
  }

  .account-info {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 0.15rem;
  }

  .account-name {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .account-email {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .account-actions {
    flex: 0 0 auto;
    margin-inline-start: auto;
  }

  .telegram-block,
  .telegram-copy,
  .telegram-link-row {
    display: grid;
    gap: var(--ui-space-2);
  }

  .telegram-status-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
  }

  .telegram-copy {
    min-width: min(100%, 18rem);
  }

  .telegram-actions {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    flex-wrap: wrap;
  }

  .telegram-loading {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
  }

  .telegram-link {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 0;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
    text-decoration: none;
  }

  .telegram-link:hover {
    color: var(--ui-accent-primary);
  }

  :global(.telegram-link svg) {
    width: 1rem;
    height: 1rem;
  }

  .telegram-feedback {
    margin: 0;
    border-radius: var(--ui-radius-md);
    padding: 0.65rem 0.85rem;
    font-size: var(--ui-type-body-sm);
  }

  .telegram-feedback--success {
    background: color-mix(in srgb, var(--ui-surface-card) 82%, #dff4e8 18%);
    border: 1px solid color-mix(in srgb, #1f8f58 40%, var(--ui-border-subtle) 60%);
    color: #176640;
  }

  .telegram-feedback--error {
    background: var(--color-danger-surface);
    border: 1px solid var(--color-danger-border);
    color: var(--color-danger-soft);
  }

  .helper {
    margin: 0;
    font-size: var(--ui-type-label);
    color: var(--ui-text-muted);
    line-height: 1.55;
  }

  /* Account information */
  .account-information-layout {
    display: grid;
    grid-template-columns: minmax(18rem, 1fr) minmax(18rem, 0.85fr);
    gap: var(--ui-space-5);
    align-items: start;
  }

  .account-details-list {
    display: grid;
    gap: var(--ui-space-3);
  }

  .account-detail-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: var(--ui-space-3);
    min-height: 4.25rem;
    padding: var(--ui-space-3);
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 58%, transparent);
  }

  .account-detail-icon,
  .password-summary__icon {
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--ui-radius-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-accent-primary);
    background: color-mix(in srgb, var(--ui-accent-primary) 12%, transparent);
  }

  .account-detail-icon :global(svg),
  .password-summary__icon :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .account-detail-label,
  .account-detail-value {
    margin: 0;
  }

  .account-detail-label {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .account-detail-value {
    margin-top: 0.2rem;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .password-summary {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--ui-space-3);
    align-items: start;
    padding: var(--ui-space-4);
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-lg);
    background: color-mix(in srgb, var(--ui-surface-secondary) 68%, transparent);
  }

  .password-summary :global(.ui-button) {
    grid-column: 2;
    justify-self: start;
  }

  .password-summary__copy {
    display: grid;
    gap: var(--ui-space-1);
  }

  .password-summary h3,
  .password-summary p {
    margin: 0;
  }

  .password-summary h3 {
    color: var(--ui-text-primary);
    font-size: var(--ui-type-body-sm);
    font-weight: 700;
    letter-spacing: 0;
  }

  .password-summary p {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-label);
    line-height: 1.6;
  }

  /* Password modal */
  .settings-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
    padding: var(--ui-space-4);
    background: color-mix(in srgb, #000 58%, transparent);
    backdrop-filter: blur(10px);
  }

  .settings-modal {
    width: min(100%, 34rem);
    max-height: min(88vh, 46rem);
    overflow: auto;
    display: grid;
    gap: var(--ui-space-4);
    padding: var(--ui-space-5);
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-surface-card);
    box-shadow: var(--ui-shadow-3);
  }

  .settings-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-4);
  }

  .settings-modal__eyebrow {
    margin: 0 0 0.35rem;
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .settings-modal h2 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-heading-sm);
    font-weight: 750;
    letter-spacing: -0.01em;
  }

  .settings-modal__close {
    width: 2.25rem;
    height: 2.25rem;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    background: var(--ui-surface-secondary);
    color: var(--ui-text-secondary);
    cursor: pointer;
  }

  .settings-modal__close:hover:not(:disabled) {
    color: var(--ui-text-primary);
    background: color-mix(in srgb, var(--ui-text-primary) 7%, var(--ui-surface-secondary) 93%);
  }

  .settings-modal__close:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .settings-modal__close :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .password-form {
    display: grid;
    gap: var(--ui-space-3);
    min-width: 0;
  }

  .security-form-copy p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .password-input-wrap {
    position: relative;
  }

  .password-input-wrap input {
    padding-inline-end: 3rem;
  }

  .password-visibility {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0.35rem;
    width: 2.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--ui-radius-sm);
    background: transparent;
    color: var(--ui-text-muted);
    cursor: pointer;
  }

  .password-visibility:hover {
    color: var(--ui-text-primary);
    background: color-mix(in srgb, var(--ui-text-primary) 7%, transparent);
  }

  .password-visibility:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .password-visibility :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .password-actions {
    display: grid;
    gap: var(--ui-space-2);
    justify-items: start;
  }

  .password-feedback {
    margin: 0;
    border-radius: var(--ui-radius-md);
    padding: 0.75rem 0.85rem;
    font-size: var(--ui-type-body-sm);
  }

  .password-feedback--success {
    background: color-mix(in srgb, var(--ui-surface-card) 82%, #dff4e8 18%);
    border: 1px solid color-mix(in srgb, #1f8f58 40%, var(--ui-border-subtle) 60%);
    color: #176640;
  }

  .password-feedback--error {
    background: var(--color-danger-surface);
    border: 1px solid var(--color-danger-border);
    color: var(--color-danger-soft);
  }

  /* Sessions */
  .sessions-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .sessions-spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--ui-border-default);
    border-top-color: var(--ui-accent-primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .sessions-error {
    margin: 0;
    font-size: var(--ui-type-body-sm);
    color: var(--color-danger-soft);
  }

  .sessions-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0;
  }

  .session-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--ui-border-subtle);
  }

  .session-row:last-child {
    border-bottom: none;
  }

  .session-row--current {
    opacity: 1;
  }

  .session-icon {
    flex: 0 0 auto;
    color: var(--ui-text-muted);
    display: flex;
    align-items: center;
  }

  .session-info {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 0.15rem;
  }

  .session-device {
    margin: 0;
    font-size: var(--ui-type-body-sm);
    font-weight: 500;
    color: var(--ui-text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .session-current-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.1rem 0.45rem;
    border-radius: var(--ui-radius-full, 9999px);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    background: color-mix(in srgb, var(--ui-accent-primary) 14%, var(--ui-surface-secondary) 86%);
    color: var(--ui-accent-primary);
    border: 1px solid color-mix(in srgb, var(--ui-accent-primary) 25%, transparent 75%);
  }

  .session-meta {
    margin: 0;
    font-size: var(--ui-type-label);
    color: var(--ui-text-muted);
  }

  .session-action {
    flex: 0 0 auto;
  }

  .sessions-feedback {
    margin: var(--ui-space-2) 0 0;
    border-radius: var(--ui-radius-md);
    padding: 0.65rem 0.85rem;
    font-size: var(--ui-type-body-sm);
  }

  .sessions-feedback--success {
    background: color-mix(in srgb, var(--ui-surface-card) 82%, #dff4e8 18%);
    border: 1px solid color-mix(in srgb, #1f8f58 40%, var(--ui-border-subtle) 60%);
    color: #176640;
  }

  .sessions-feedback--error {
    background: var(--color-danger-surface);
    border: 1px solid var(--color-danger-border);
    color: var(--color-danger-soft);
  }

  .sessions-footer {
    margin-top: var(--ui-space-3);
    display: flex;
    align-items: center;
  }

  @media (max-width: 640px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    :global(.settings-card--wide.ui-section) {
      grid-column: auto;
    }

    .account-name {
      max-width: 100%;
    }

    .account-actions {
      width: 100%;
      margin-inline-start: 0;
    }

    :global(.account-actions .ui-button) {
      width: 100%;
    }

    .account-information-layout {
      grid-template-columns: 1fr;
    }

    .password-summary :global(.ui-button) {
      grid-column: 1 / -1;
      width: 100%;
    }

    .settings-modal-backdrop {
      align-items: end;
      padding: var(--ui-space-2);
    }

    .settings-modal {
      max-height: 92vh;
      padding: var(--ui-space-4);
    }

    .session-row {
      flex-wrap: wrap;
    }

    .session-action {
      margin-inline-start: 2.25rem;
    }
  }
</style>
