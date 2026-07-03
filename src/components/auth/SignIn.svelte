<script>
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import AuthChallenge from './AuthChallenge.svelte';
  import { t } from '../../lib/i18n/t.js';
  import { signIn } from '../../stores/auth.js';
  import { isAuthChallengeEnabled } from '../../config.js';
  import { FORGOT_PASSWORD_PATH, VERIFY_EMAIL_PATH } from '../../routes.js';
  import { router } from '../../stores/router.js';
  import { validateEmail, validatePassword } from './validation.js';

  export let notice = '';
  export let redirectTarget = '/home';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let showPassword = false;
  let challengeToken = '';
  let challengeRef;
  let touched = {
    email: false,
    password: false,
  };
  const challengeEnabled = isAuthChallengeEnabled();

  $: signUpHref = buildAuthHref('/sign-up');
  $: fieldErrors = {
    email: touched.email ? validateEmail(email, t) : '',
    password: touched.password ? validatePassword(password, t) : '',
  };

  $: hasFieldErrors = Boolean(fieldErrors.email || fieldErrors.password);

  function markAllTouched() {
    touched = {
      email: true,
      password: true,
    };
  }

  async function handleSubmit() {
    if (loading) return;

    markAllTouched();
    error = '';

    const nextEmailError = validateEmail(email, t);
    const nextPasswordError = validatePassword(password, t);
    if (nextEmailError || nextPasswordError) {
      return;
    }

    if (challengeEnabled && !challengeToken) {
      error = t('auth.errors.challengeRequired');
      return;
    }

    loading = true;
    const res = await signIn(email.trim(), password, { challengeToken });
    loading = false;

    if (res.error) {
      if (res.error.code === 'email_verification_required') {
        const params = new URLSearchParams({
          status: 'pending',
          email: email.trim(),
          source: 'signin',
        });
        router.replace(`${VERIFY_EMAIL_PATH}?${params.toString()}`);
        return;
      }

      error = res.error.message || t('auth.signIn.errors.failed');
      if (challengeEnabled && (res.error.code === 'challenge_required' || res.error.code === 'challenge_failed' || res.error.code === 'rate_limited')) {
        challengeRef?.reset?.();
        challengeToken = '';
      }
      return;
    }

  }

  function buildAuthHref(path) {
    const params = new URLSearchParams();
    if (redirectTarget && redirectTarget !== '/home') {
      params.set('redirect', redirectTarget);
    }

    const query = params.toString();
    return `#${path}${query ? `?${query}` : ''}`;
  }

  function goToForgotPassword() {
    router.navigate(FORGOT_PASSWORD_PATH);
  }
</script>

<Card class="auth-card" variant="raised" padding="lg" border="subtle">
  <header class="auth-header">
    <p class="auth-eyebrow">{t('auth.signIn.eyebrow')}</p>
    <h2>{t('auth.signIn.title')}</h2>
    <p>{t('auth.signIn.subtitle')}</p>
  </header>

  {#if notice}
    <p class="auth-notice">{notice}</p>
  {/if}

  <form class="auth-form" on:submit|preventDefault={handleSubmit} novalidate>
    <FieldShell
      label={t('auth.fields.email')}
      forId="email"
      required
      error={fieldErrors.email}
    >
      <input
        id="email"
        type="email"
        bind:value={email}
        inputmode="email"
        autocomplete="email"
        placeholder={t('auth.signIn.placeholders.email')}
        aria-invalid={fieldErrors.email ? 'true' : 'false'}
        on:blur={() => (touched = { ...touched, email: true })}
      />
    </FieldShell>

    <FieldShell
      label={t('auth.fields.password')}
      forId="password"
      required
      error={fieldErrors.password}
    >
      <div class="password-field">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          bind:value={password}
          autocomplete="current-password"
          placeholder={t('auth.signIn.placeholders.password')}
          aria-invalid={fieldErrors.password ? 'true' : 'false'}
          on:blur={() => (touched = { ...touched, password: true })}
        />
        <button
          type="button"
          class="password-toggle"
          aria-label={showPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')}
          on:click={() => (showPassword = !showPassword)}
        >
          {showPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')}
        </button>
      </div>
    </FieldShell>

    <Button type="button" variant="ghost" size="sm" className="forgot-btn" on:click={goToForgotPassword}>
      {t('auth.signIn.actions.forgotPassword')}
    </Button>

    <AuthChallenge
      bind:this={challengeRef}
      action="sign_in"
      on:change={(event) => {
        challengeToken = event.detail.token;
      }}
    />

    {#if error}
      <p class="auth-error" role="alert">{error}</p>
    {/if}

    <Button type="submit" variant="primary" loading={loading} disabled={loading || hasFieldErrors} block>
      {loading ? t('auth.signIn.actions.loading') : t('auth.signIn.actions.submit')}
    </Button>
  </form>

  <p class="toggle-text">
    {t('auth.signIn.switch.prompt')}
    <a class="auth-switch-link" href={signUpHref}>
      {t('auth.signIn.switch.action')}
    </a>
  </p>
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

  .auth-header h2 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(1.75rem, 4vw, 2rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.1;
  }

  .auth-header p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .auth-form {
    display: grid;
    gap: var(--ui-space-4);
  }

  .auth-notice,
  .auth-error {
    margin: 0;
    border: 1px solid var(--color-danger-border);
    border-radius: var(--ui-radius-md);
    padding: 0.75rem 0.875rem;
    font-size: var(--ui-type-body-sm);
    line-height: 1.5;
  }

  .auth-notice {
    border-color: var(--ui-border-default);
    background: color-mix(in srgb, var(--ui-surface-secondary) 52%, transparent);
    color: var(--ui-text-secondary);
  }

  .auth-error {
    background: var(--color-danger-surface);
    color: var(--color-danger-soft);
  }

  .password-field {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
  }

  .password-toggle {
    flex: 0 0 auto;
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    border-radius: var(--ui-radius-sm);
    background: transparent;
    color: var(--ui-text-secondary);
    font: inherit;
    font-size: var(--ui-type-label);
    font-weight: 600;
    cursor: pointer;
    padding-inline: 0.625rem;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  .password-toggle:hover {
    border-color: var(--ui-border-default);
    background: var(--ui-surface-ghost);
    color: var(--ui-text-primary);
  }

  .password-toggle:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .toggle-text {
    margin: 0;
    color: var(--ui-text-muted);
    text-align: center;
    font-size: var(--ui-type-body-sm);
    line-height: 1.5;
  }

  .auth-switch-link {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    margin-inline-start: 0.25rem;
    color: var(--ui-text-primary);
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .auth-switch-link:hover {
    color: var(--ui-text-secondary);
  }

  .auth-switch-link:focus-visible {
    border-radius: var(--ui-radius-xs);
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  :global(.forgot-btn) {
    justify-self: start;
    min-height: 2.75rem;
    padding: 0;
    color: var(--ui-text-secondary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
