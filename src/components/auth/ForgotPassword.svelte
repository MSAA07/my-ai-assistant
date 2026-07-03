<script>
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import AuthChallenge from './AuthChallenge.svelte';
  import { t } from '../../lib/i18n/t.js';
  import { requestPasswordReset } from '../../stores/auth.js';
  import { isAuthChallengeEnabled } from '../../config.js';
  import { router } from '../../stores/router.js';
  import { validateEmail } from './validation.js';

  let email = '';
  let touched = false;
  let loading = false;
  let error = '';
  let completed = false;
  let challengeToken = '';
  let challengeRef;
  const challengeEnabled = isAuthChallengeEnabled();

  $: emailError = touched ? validateEmail(email, t) : '';

  async function handleSubmit() {
    if (loading) return;

    touched = true;
    error = '';

    const nextEmailError = validateEmail(email, t);
    if (nextEmailError) {
      return;
    }

    if (challengeEnabled && !challengeToken) {
      error = t('auth.errors.challengeRequired');
      return;
    }

    loading = true;
    const result = await requestPasswordReset(email.trim(), { challengeToken });
    loading = false;

    if (result.error && (result.error.code === 'network_failure' || result.error.code === 'network_timeout' || result.error.code === 'server_failure')) {
      error = result.error.message || t('auth.forgotPassword.errors.failed');
      return;
    }

    if (result.error && (result.error.code === 'challenge_required' || result.error.code === 'challenge_failed' || result.error.code === 'rate_limited')) {
      error = result.error.message || t('auth.forgotPassword.errors.failed');
      challengeRef?.reset?.();
      challengeToken = '';
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

      <AuthChallenge
        bind:this={challengeRef}
        action="forgot_password"
        on:change={(event) => {
          challengeToken = event.detail.token;
        }}
      />

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
    width: min(420px, 100%);
    gap: var(--ui-space-5);
    border-color: color-mix(in srgb, var(--ui-border-default) 84%, transparent);
    background: color-mix(in srgb, var(--ui-surface-card) 96%, var(--ui-bg-page) 4%);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
  }

  .auth-header {
    display: grid;
    gap: 0.5rem;
    text-align: start;
  }

  .auth-eyebrow {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .auth-header h2,
  .auth-header p {
    margin: 0;
  }

  .auth-header h2 {
    color: var(--ui-text-primary);
    font-size: clamp(1.75rem, 4vw, 2rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.1;
  }

  .auth-header p {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .auth-form {
    display: grid;
    gap: var(--ui-space-4);
  }

  .auth-feedback {
    margin: 0;
    border-radius: var(--ui-radius-md);
    padding: 0.75rem 0.875rem;
    font-size: var(--ui-type-body-sm);
    line-height: 1.5;
  }

  .auth-feedback--success {
    background: color-mix(in srgb, var(--ui-accent-success) 12%, var(--ui-surface-card) 88%);
    border: 1px solid color-mix(in srgb, var(--ui-accent-success) 36%, var(--ui-border-subtle) 64%);
    color: color-mix(in srgb, var(--ui-accent-success) 74%, var(--ui-text-primary) 26%);
  }

  .auth-feedback--error {
    background: var(--color-danger-surface);
    border: 1px solid var(--color-danger-border);
    color: var(--color-danger-soft);
  }

  @media (max-width: 768px) {
    :global(.auth-card .ui-field__label),
    :global(.auth-card .ui-field__meta),
    .auth-eyebrow {
      font-size: var(--ui-type-body-sm);
      line-height: 1.35;
    }
  }
</style>
