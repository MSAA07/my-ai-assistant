<script>
  import { onDestroy } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { t } from '../../lib/i18n/t.js';
  import { resetPassword } from '../../stores/auth.js';
  import { router } from '../../stores/router.js';
  import { validateConfirmPassword, validatePassword } from './validation.js';

  export let token = '';
  export let status = '';
  export let errorCode = '';

  let newPassword = '';
  let confirmPassword = '';
  let touched = {
    newPassword: false,
    confirmPassword: false,
  };
  let loading = false;
  let feedback = '';
  let feedbackTone = 'info';
  let redirectId = null;

  $: normalizedStatus = status || (token ? 'ready' : 'error');
  $: fieldErrors = {
    newPassword: touched.newPassword ? validatePassword(newPassword, t) : '',
    confirmPassword: touched.confirmPassword ? validateConfirmPassword(newPassword, confirmPassword, t) : '',
  };

  function mapTokenError(code) {
    if (code === 'expired_token') return t('auth.resetPassword.error.expiredToken');
    if (code === 'already_used') return t('auth.resetPassword.error.alreadyUsed');
    if (code === 'invalid_token') return t('auth.resetPassword.error.invalidToken');
    return t('auth.resetPassword.error.generic');
  }

  async function handleSubmit() {
    if (loading || !token) return;

    touched = {
      newPassword: true,
      confirmPassword: true,
    };
    feedback = '';
    feedbackTone = 'info';

    const nextPasswordError = validatePassword(newPassword, t);
    const nextConfirmError = validateConfirmPassword(newPassword, confirmPassword, t);
    if (nextPasswordError || nextConfirmError) {
      return;
    }

    loading = true;
    const result = await resetPassword(token, newPassword);
    loading = false;

    if (result.error) {
      feedbackTone = 'error';
      feedback = result.error.code === 'reset_token_invalid'
        ? mapTokenError(errorCode || 'invalid_token')
        : result.error.message || t('auth.resetPassword.error.generic');
      return;
    }

    feedbackTone = 'success';
    feedback = t('auth.resetPassword.success.body');
    redirectId = window.setTimeout(() => {
      router.replace('/sign-in?reason=password_reset');
    }, 1600);
  }

  function goToSignIn() {
    router.replace('/sign-in');
  }

  onDestroy(() => {
    window.clearTimeout(redirectId);
  });
</script>

<Card class="auth-card" variant="raised" padding="lg" border="subtle">
  <header class="auth-header">
    <p class="auth-eyebrow">{t('auth.resetPassword.eyebrow')}</p>
    <h2>{normalizedStatus === 'success' ? t('auth.resetPassword.success.title') : t('auth.resetPassword.title')}</h2>
    <p>
      {#if normalizedStatus === 'error'}
        {t('auth.resetPassword.error.subtitle', { error: mapTokenError(errorCode || 'invalid_token') })}
      {:else if feedbackTone === 'success'}
        {t('auth.resetPassword.success.subtitle')}
      {:else}
        {t('auth.resetPassword.subtitle')}
      {/if}
    </p>
  </header>

  {#if feedback}
    <p class={`auth-feedback auth-feedback--${feedbackTone}`} role="status">{feedback}</p>
  {/if}

  {#if normalizedStatus === 'error'}
    <Button type="button" variant="primary" block on:click={goToSignIn}>
      {t('auth.resetPassword.actions.backToSignIn')}
    </Button>
  {:else if feedbackTone === 'success'}
    <Button type="button" variant="primary" block on:click={goToSignIn}>
      {t('auth.resetPassword.actions.backToSignIn')}
    </Button>
  {:else}
    <form class="auth-form" on:submit|preventDefault={handleSubmit} novalidate>
      <FieldShell
        label={t('auth.fields.password')}
        forId="reset-password"
        required
        error={fieldErrors.newPassword}
        hint={t('auth.validation.passwordHint')}
      >
        <input
          id="reset-password"
          type="password"
          bind:value={newPassword}
          autocomplete="new-password"
          placeholder={t('auth.resetPassword.placeholders.password')}
          aria-invalid={fieldErrors.newPassword ? 'true' : 'false'}
          on:blur={() => (touched = { ...touched, newPassword: true })}
        />
      </FieldShell>

      <FieldShell
        label={t('auth.fields.confirmPassword')}
        forId="reset-confirm-password"
        required
        error={fieldErrors.confirmPassword}
      >
        <input
          id="reset-confirm-password"
          type="password"
          bind:value={confirmPassword}
          autocomplete="new-password"
          placeholder={t('auth.resetPassword.placeholders.confirmPassword')}
          aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
          on:blur={() => (touched = { ...touched, confirmPassword: true })}
        />
      </FieldShell>

      <Button type="submit" variant="primary" loading={loading} disabled={loading || !!fieldErrors.newPassword || !!fieldErrors.confirmPassword} block>
        {loading ? t('auth.resetPassword.actions.loading') : t('auth.resetPassword.actions.submit')}
      </Button>

      <Button type="button" variant="ghost" block on:click={goToSignIn}>
        {t('auth.resetPassword.actions.backToSignIn')}
      </Button>
    </form>
  {/if}
</Card>

<style>
  :global(.auth-card) {
    width: min(440px, 100%);
  }

  .auth-header {
    display: grid;
    gap: 0.45rem;
    text-align: left;
  }

  .auth-eyebrow {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .auth-header h2,
  .auth-header p {
    margin: 0;
  }

  .auth-header h2 {
    color: var(--color-text-primary);
    font-size: 1.5rem;
    letter-spacing: -0.03em;
  }

  .auth-header p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .auth-form {
    display: grid;
    gap: var(--space-3);
  }

  .auth-feedback {
    margin: 0;
    border-radius: var(--ui-radius-md);
    padding: 0.65rem 0.8rem;
    font-size: var(--font-size-sm);
  }

  .auth-feedback--success {
    background: color-mix(in srgb, var(--ui-surface-card) 82%, #dff4e8 18%);
    border: 1px solid color-mix(in srgb, #1f8f58 40%, var(--ui-border-subtle) 60%);
    color: #176640;
  }

  .auth-feedback--error {
    background: var(--color-danger-surface);
    border: 1px solid var(--color-danger-border);
    color: var(--color-danger-soft);
  }
</style>
