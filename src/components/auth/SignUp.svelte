<script>
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import AuthChallenge from './AuthChallenge.svelte';
  import { t } from '../../lib/i18n/t.js';
  import { signUp } from '../../stores/auth.js';
  import { isAuthChallengeEnabled } from '../../config.js';
  import { router } from '../../stores/router.js';
  import { VERIFY_EMAIL_PATH } from '../../routes.js';
  import {
    validateEmail,
    validatePassword,
    validateName,
    validateConfirmPassword,
  } from './validation.js';

  export let notice = '';
  export let redirectTarget = '/home';

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let loading = false;
  let showPassword = false;
  let showConfirmPassword = false;
  let challengeToken = '';
  let challengeRef;
  let touched = {
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  };
  const challengeEnabled = isAuthChallengeEnabled();

  $: signInHref = buildAuthHref('/sign-in');
  $: passwordStrength = getPasswordStrength(password);
  $: fieldErrors = {
    name: touched.name ? validateName(name, t) : '',
    email: touched.email ? validateEmail(email, t) : '',
    password: touched.password ? validatePassword(password, t) : '',
    confirmPassword: touched.confirmPassword ? validateConfirmPassword(password, confirmPassword, t) : '',
  };

  $: hasFieldErrors = Boolean(
    fieldErrors.name
      || fieldErrors.email
      || fieldErrors.password
      || fieldErrors.confirmPassword
  );

  function markAllTouched() {
    touched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    };
  }

  async function handleSubmit() {
    if (loading) return;

    markAllTouched();
    error = '';

    const nextErrors = {
      name: validateName(name, t),
      email: validateEmail(email, t),
      password: validatePassword(password, t),
      confirmPassword: validateConfirmPassword(password, confirmPassword, t),
    };

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (challengeEnabled && !challengeToken) {
      error = t('auth.errors.challengeRequired');
      return;
    }

    loading = true;
    const res = await signUp(email.trim(), password, name.trim(), { challengeToken });
    loading = false;

    if (res.error) {
      error = res.error.message || t('auth.signUp.errors.failed');
      if (challengeEnabled && (res.error.code === 'challenge_required' || res.error.code === 'challenge_failed' || res.error.code === 'rate_limited')) {
        challengeRef?.reset?.();
        challengeToken = '';
      }
      return;
    }

    const params = new URLSearchParams({
      status: 'pending',
      email: email.trim(),
      source: 'signup',
    });
    router.replace(`${VERIFY_EMAIL_PATH}?${params.toString()}`);
  }

  function getPasswordStrength(pw) {
    if (!pw) return null;

    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
    const typeCount = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length;

    if (pw.length < 8) {
      return { level: 1, label: 'Weak', color: 'var(--ui-accent-danger)' };
    }
    if (typeCount < 2) {
      return { level: 2, label: 'Fair', color: 'var(--ui-accent-warning)' };
    }
    return { level: 3, label: 'Strong', color: 'var(--ui-accent-success)' };
  }

  function buildAuthHref(path) {
    const params = new URLSearchParams();
    if (redirectTarget && redirectTarget !== '/home') {
      params.set('redirect', redirectTarget);
    }

    const query = params.toString();
    return `#${path}${query ? `?${query}` : ''}`;
  }
</script>

<Card class="auth-card" variant="raised" padding="lg" border="subtle">
  <header class="auth-header">
    <h2>{t('auth.signUp.title')}</h2>
    <p>{t('auth.signUp.subtitle')}</p>
  </header>

  {#if notice}
    <p class="auth-notice">{notice}</p>
  {/if}

  <form class="auth-form" on:submit|preventDefault={handleSubmit} novalidate>
    <FieldShell
      label={t('auth.fields.name')}
      forId="name"
      required
      error={fieldErrors.name}
    >
      <input
        id="name"
        type="text"
        bind:value={name}
        autocomplete="name"
        placeholder={t('auth.signUp.placeholders.name')}
        aria-invalid={fieldErrors.name ? 'true' : 'false'}
        on:blur={() => (touched = { ...touched, name: true })}
      />
    </FieldShell>

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
        placeholder={t('auth.signUp.placeholders.email')}
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
          autocomplete="new-password"
          placeholder={t('auth.signUp.placeholders.password')}
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

    {#if passwordStrength}
      <div class="password-strength">
        <div class="password-strength__bars">
          <span
            class="password-strength__bar"
            style="background: {passwordStrength.level >= 1 ? passwordStrength.color : 'var(--ui-border-default)'}"
          ></span>
          <span
            class="password-strength__bar"
            style="background: {passwordStrength.level >= 2 ? passwordStrength.color : 'var(--ui-border-default)'}"
          ></span>
          <span
            class="password-strength__bar"
            style="background: {passwordStrength.level >= 3 ? passwordStrength.color : 'var(--ui-border-default)'}"
          ></span>
        </div>
        <span class="password-strength__label" style="color: {passwordStrength.color}">
          {passwordStrength.label}
        </span>
      </div>
    {/if}

    <FieldShell
      label={t('auth.fields.confirmPassword')}
      forId="confirm-password"
      required
      error={fieldErrors.confirmPassword}
    >
      <div class="password-field">
        <input
          id="confirm-password"
          type={showConfirmPassword ? 'text' : 'password'}
          bind:value={confirmPassword}
          autocomplete="new-password"
          placeholder={t('auth.signUp.placeholders.confirmPassword')}
          aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
          on:blur={() => (touched = { ...touched, confirmPassword: true })}
        />
        <button
          type="button"
          class="password-toggle"
          aria-label={showConfirmPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')}
          on:click={() => (showConfirmPassword = !showConfirmPassword)}
        >
          {showConfirmPassword ? t('auth.actions.hidePassword') : t('auth.actions.showPassword')}
        </button>
      </div>
    </FieldShell>

    <AuthChallenge
      bind:this={challengeRef}
      action="sign_up"
      on:change={(event) => {
        challengeToken = event.detail.token;
      }}
    />

    {#if error}
      <p class="auth-error" role="alert">{error}</p>
    {/if}

    <Button type="submit" variant="primary" loading={loading} disabled={loading || hasFieldErrors} block>
      {loading ? t('auth.signUp.actions.loading') : t('auth.signUp.actions.submit')}
    </Button>

    <p class="trust-line">Free to use • No credit card required</p>
  </form>

  <p class="toggle-text">
    {t('auth.signUp.switch.prompt')}
    <a class="auth-switch-link" href={signInHref}>
      {t('auth.signUp.switch.action')}
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
    gap: var(--ui-space-3);
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
    min-height: 2rem;
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

  .password-strength {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    margin-top: -0.15rem;
  }

  .password-strength__bars {
    display: flex;
    gap: 0.25rem;
  }

  .password-strength__bar {
    width: 1.75rem;
    height: 0.25rem;
    border-radius: var(--ui-radius-pill, 999px);
    background: var(--ui-border-default);
    transition: background var(--motion-fast) var(--ease-standard);
  }

  .password-strength__label {
    font-size: var(--ui-type-label);
    font-weight: 600;
  }

  .trust-line {
    margin: 0;
    color: var(--ui-text-muted);
    text-align: center;
    font-size: var(--ui-type-label);
  }

  .toggle-text {
    margin: 0;
    color: var(--ui-text-muted);
    text-align: center;
    font-size: var(--ui-type-body-sm);
    line-height: 1.5;
  }

  .auth-switch-link {
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
</style>
