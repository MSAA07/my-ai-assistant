<script>
  import PageLayout from '../lib/components/layout/PageLayout.svelte';
  import LanguageToggle from '../lib/components/ui/LanguageToggle.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import FieldShell from '../lib/components/ui/FieldShell.svelte';
  import Section from '../lib/components/ui/Section.svelte';
  import SettingsPanelSkeleton from '../lib/components/ui/SettingsPanelSkeleton.svelte';
  import ThemeToggle from '../lib/components/ui/ThemeToggle.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import { changePassword, session, signOut } from '../stores/auth.js';
  import { theme } from '../stores/theme.js';
  import { t } from '../lib/i18n/t.js';
  import { validateConfirmPassword, validatePassword } from '../components/auth/validation.js';

  let loggingOut = false;
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

  $: userName = $session?.user?.name ?? t('settings.account.anonymous');
  $: userEmail = $session?.user?.email ?? t('settings.account.noEmail');
  $: plan = $session?.user?.plan ?? 'free';
  $: planLabel = plan === 'pro' || plan === 'premium' ? t('nav.proBadge') : t('nav.freeBadge');
  $: userInitial = (userName?.[0] ?? '?').toUpperCase();

  $: passwordErrors = {
    currentPassword: passwordTouched.currentPassword && !currentPassword ? t('auth.validation.currentPasswordRequired') : '',
    newPassword: passwordTouched.newPassword ? validatePassword(newPassword, t) : '',
    confirmPassword: passwordTouched.confirmPassword ? validateConfirmPassword(newPassword, confirmPassword, t) : '',
  };
  $: passwordHasErrors = Boolean(passwordErrors.currentPassword || passwordErrors.newPassword || passwordErrors.confirmPassword);

  async function handleLogout() {
    loggingOut = true;
    try {
      await signOut();
    } finally {
      loggingOut = false;
    }
  }

  function handleThemeChange(event) {
    theme.setTheme(event.detail.theme);
  }

  async function handleChangePassword() {
    if (changingPassword) return;

    passwordTouched = {
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    };
    passwordFeedback = '';

    const nextErrors = {
      currentPassword: currentPassword ? '' : t('auth.validation.currentPasswordRequired'),
      newPassword: validatePassword(newPassword, t),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword, t),
    };

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

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
    passwordTouched = {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    };
  }
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

  @media (max-width: 640px) {
    .account-actions {
      width: 100%;
      margin-inline-start: 0;
    }

    :global(.account-actions .ui-button) {
      width: 100%;
    }
  }
</style>
