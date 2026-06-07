<script>
  import { onMount } from 'svelte';
  import { ExternalLink, RefreshCw, Send, Unlink } from '@lucide/svelte';
  import PageLayout from '../lib/components/layout/PageLayout.svelte';
  import LanguageToggle from '../lib/components/ui/LanguageToggle.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import FieldShell from '../lib/components/ui/FieldShell.svelte';
  import Section from '../lib/components/ui/Section.svelte';
  import SettingsPanelSkeleton from '../lib/components/ui/SettingsPanelSkeleton.svelte';
  import ThemeToggle from '../lib/components/ui/ThemeToggle.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import {
    changePassword,
    listSessions,
    revokeSession,
    revokeOtherSessions,
    session,
    signOut,
  } from '../stores/auth.js';
  import { API_BASE } from '../config.js';
  import {
    createTelegramLinkToken,
    disconnectTelegram,
    getTelegramStatus
  } from '../lib/api/studyHub.js';
  import { theme } from '../stores/theme.js';
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

  // ── Appearance ────────────────────────────────────────────────────────
  function handleThemeChange(event) {
    theme.setTheme(event.detail.theme);
  }

  // ── Security — change password ────────────────────────────────────────
  let changingPassword = false;
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
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

  // ── Data Export ──────────────────────────────────────────────────────
  let exportDownloading = false;
  let exportError = '';
  let exportSuccess = false;

  async function handleDataExport() {
    if (exportDownloading) return;
    exportDownloading = true;
    exportError = '';
    exportSuccess = false;

    try {
      const response = await fetch(`${API_BASE}/api/user/export`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        exportError = t('settings.dataExport.errors.failed');
        return;
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition') ?? '';
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `studymaxing-data-export-${new Date().toISOString().slice(0, 10)}.json`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      exportSuccess = true;
    } catch {
      exportError = t('settings.dataExport.errors.failed');
    } finally {
      exportDownloading = false;
    }
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
  <PageLayout class="settings-page" width="wide" gap="compact">
    <PageHeader
      eyebrow={t('settings.eyebrow')}
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
    />

    <div class="settings-grid">

      <!-- Account -->
      <Section
        id="account"
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

      <!-- Appearance -->
      <Section
        title={t('settings.theme.title')}
        description={t('settings.theme.description')}
      >
        <ThemeToggle value={$theme} on:change={handleThemeChange} />
      </Section>

      <!-- Language -->
      <Section
        id="language"
        title={t('settings.language.title')}
        description={t('settings.language.description')}
      >
        <div class="lang-block">
          <LanguageToggle />
          <p class="helper">{t('settings.language.helper')}</p>
        </div>
      </Section>

      <!-- Telegram -->
      <Section
        id="telegram"
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
        title={t('settings.security.title')}
        description={t('settings.security.description')}
      >
        <div class="password-form">
          <FieldShell
            label={t('auth.changePassword.fields.currentPassword')}
            forId="current-password"
            required
            error={passwordErrors.currentPassword}
          >
            <input
              id="current-password"
              type="password"
              bind:value={currentPassword}
              autocomplete="current-password"
              placeholder={t('auth.changePassword.placeholders.currentPassword')}
              aria-invalid={passwordErrors.currentPassword ? 'true' : 'false'}
              on:blur={() => (passwordTouched = { ...passwordTouched, currentPassword: true })}
            />
          </FieldShell>

          <FieldShell
            label={t('auth.changePassword.fields.newPassword')}
            forId="new-password"
            required
            error={passwordErrors.newPassword}
            hint={t('auth.validation.passwordHint')}
          >
            <input
              id="new-password"
              type="password"
              bind:value={newPassword}
              autocomplete="new-password"
              placeholder={t('auth.changePassword.placeholders.newPassword')}
              aria-invalid={passwordErrors.newPassword ? 'true' : 'false'}
              on:blur={() => (passwordTouched = { ...passwordTouched, newPassword: true })}
            />
          </FieldShell>

          <FieldShell
            label={t('auth.fields.confirmPassword')}
            forId="confirm-new-password"
            required
            error={passwordErrors.confirmPassword}
          >
            <input
              id="confirm-new-password"
              type="password"
              bind:value={confirmPassword}
              autocomplete="new-password"
              placeholder={t('auth.changePassword.placeholders.confirmPassword')}
              aria-invalid={passwordErrors.confirmPassword ? 'true' : 'false'}
              on:blur={() => (passwordTouched = { ...passwordTouched, confirmPassword: true })}
            />
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
      </Section>

      <!-- Data Export -->
      <Section
        id="data-export"
        title={t('settings.dataExport.title')}
        description={t('settings.dataExport.description')}
      >
        <div class="export-block">
          <div class="export-actions">
            <Button
              type="button"
              variant="secondary"
              loading={exportDownloading}
              disabled={exportDownloading}
              on:click={handleDataExport}
            >
              {exportDownloading ? t('settings.dataExport.downloading') : t('settings.dataExport.download')}
            </Button>
          </div>

          {#if exportError}
            <p class="export-feedback export-feedback--error" role="alert">{exportError}</p>
          {:else if exportSuccess}
            <p class="export-feedback export-feedback--success" role="status">{t('settings.dataExport.successNote')}</p>
          {/if}

          <p class="helper">{t('settings.dataExport.clarification')}</p>
        </div>
      </Section>

      <!-- Sessions -->
      <Section
        id="sessions"
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
{/if}

<style>
  :global(.settings-page) {
    display: grid;
    gap: var(--study-flow-page-gap);
    min-width: 0;
  }

  .settings-grid {
    display: grid;
    gap: var(--ui-space-3);
    min-width: 0;
  }

  /* Account row */
  .account-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
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

  /* Language */
  .lang-block {
    display: grid;
    gap: var(--ui-space-2);
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

  /* Password form */
  .password-form {
    display: grid;
    gap: var(--ui-space-3);
    max-width: 34rem;
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

  /* Data Export */
  .export-block {
    display: grid;
    gap: var(--ui-space-2);
    max-width: 34rem;
  }

  .export-actions {
    display: flex;
    align-items: center;
  }

  .export-feedback {
    margin: 0;
    border-radius: var(--ui-radius-md);
    padding: 0.65rem 0.85rem;
    font-size: var(--ui-type-body-sm);
  }

  .export-feedback--success {
    background: color-mix(in srgb, var(--ui-surface-card) 82%, #dff4e8 18%);
    border: 1px solid color-mix(in srgb, #1f8f58 40%, var(--ui-border-subtle) 60%);
    color: #176640;
  }

  .export-feedback--error {
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

    .session-row {
      flex-wrap: wrap;
    }

    .session-action {
      margin-inline-start: 2.25rem;
    }
  }
</style>
