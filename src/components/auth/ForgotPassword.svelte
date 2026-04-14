<script>
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { t } from '../../lib/i18n/t.js';
  import { requestPasswordReset } from '../../stores/auth.js';
  import { router } from '../../stores/router.js';
  import { validateEmail } from './validation.js';

  let email = '';
  let touched = false;
  let loading = false;
  let error = '';
  let completed = false;

  $: emailError = touched ? validateEmail(email, t) : '';

  async function handleSubmit() {
    if (loading) return;

    touched = true;
    error = '';

    const nextEmailError = validateEmail(email, t);
    if (nextEmailError) {
      return;
    }

    loading = true;
    const result = await requestPasswordReset(email.trim());
    loading = false;

    if (result.error && (result.error.code === 'network_failure' || result.error.code === 'network_timeout' || result.error.code === 'server_failure')) {
      error = result.error.message || t('auth.forgotPassword.errors.failed');
      return;
    }

    completed = true;
  }

  function goToSignIn() {
    router.navigate('/sign-in');
  }
</script>

<Card class="auth-card" variant="raised" padding="lg" border="subtle">
  <header class="auth-header">
    <p class="auth-eyebrow">{t('auth.forgotPassword.eyebrow')}</p>
    <h2>{t('auth.forgotPassword.title')}</h2>
    <p>{completed ? t('auth.forgotPassword.success.subtitle') : t('auth.forgotPassword.subtitle')}</p>
  </header>

  {#if completed}
    <p class="auth-feedback auth-feedback--success">{t('auth.forgotPassword.success.body')}</p>
    <Button type="button" variant="primary" block on:click={goToSignIn}>
      {t('auth.forgotPassword.actions.backToSignIn')}
    </Button>
  {:else}
    <form class="auth-form" on:submit|preventDefault={handleSubmit} novalidate>
      <FieldShell
        label={t('auth.fields.email')}
        forId="forgot-email"
        required
        error={emailError}
      >
        <input
          id="forgot-email"
          type="email"
          bind:value={email}
          inputmode="email"
          autocomplete="email"
          placeholder={t('auth.forgotPassword.placeholders.email')}
          aria-invalid={emailError ? 'true' : 'false'}
          on:blur={() => (touched = true)}
        />
      </FieldShell>

      {#if error}
        <p class="auth-feedback auth-feedback--error" role="alert">{error}</p>
      {/if}

      <Button type="submit" variant="primary" loading={loading} disabled={loading || !!emailError} block>
        {loading ? t('auth.forgotPassword.actions.loading') : t('auth.forgotPassword.actions.submit')}
      </Button>

      <Button type="button" variant="ghost" block on:click={goToSignIn}>
        {t('auth.forgotPassword.actions.backToSignIn')}
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
