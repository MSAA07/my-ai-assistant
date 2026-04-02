<script>
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { t } from '../../lib/i18n/t.js';
  import { signIn } from '../../stores/auth.js';
  import { router } from '../../stores/router.js';
  import { validateEmail, validatePassword } from './validation.js';

  export let notice = '';
  export let redirectTarget = '/home';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let showPassword = false;
  let touched = {
    email: false,
    password: false,
  };

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

    loading = true;
    const res = await signIn(email.trim(), password);
    loading = false;

    if (res.error) {
      error = res.error.message || t('auth.signIn.errors.failed');
      return;
    }

  }

  function goToSignUp() {
    const params = new URLSearchParams();
    if (redirectTarget && redirectTarget !== '/home') {
      params.set('redirect', redirectTarget);
    }

    const query = params.toString();
    router.navigate(`/sign-up${query ? `?${query}` : ''}`);
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

    {#if error}
      <p class="auth-error" role="alert">{error}</p>
    {/if}

    <Button type="submit" variant="primary" loading={loading} disabled={loading || hasFieldErrors} block>
      {loading ? t('auth.signIn.actions.loading') : t('auth.signIn.actions.submit')}
    </Button>
  </form>

  <p class="toggle-text">
    {t('auth.signIn.switch.prompt')}
    <Button type="button" variant="ghost" size="sm" className="link-btn" on:click={goToSignUp}>
      {t('auth.signIn.switch.action')}
    </Button>
  </p>
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

  .auth-header h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1.5rem;
    letter-spacing: -0.03em;
  }

  .auth-header p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .auth-form {
    display: grid;
    gap: var(--space-3);
  }

  .auth-notice,
  .auth-error {
    margin: 0;
    border: 1px solid var(--color-danger-border);
    border-radius: var(--ui-radius-md);
    padding: 0.65rem 0.8rem;
    font-size: var(--font-size-sm);
  }

  .auth-notice {
    border-color: color-mix(in srgb, var(--ui-border-accent) 55%, var(--ui-border-subtle) 45%);
    background: color-mix(in srgb, var(--ui-surface-card) 84%, var(--ui-surface-secondary) 16%);
    color: var(--color-text-secondary);
  }

  .auth-error {
    background: var(--color-danger-surface);
    color: var(--color-danger-soft);
  }

  .password-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .password-toggle {
    flex: 0 0 auto;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font: inherit;
    font-size: var(--font-size-xs);
    font-weight: 600;
    cursor: pointer;
    padding-inline-end: 0.7rem;
  }

  .toggle-text {
    margin: 0;
    color: var(--color-text-muted);
    text-align: left;
    font-size: var(--font-size-sm);
  }

  :global(.link-btn) {
    margin-inline-start: 0.25rem;
    min-height: auto;
    padding-inline: 0.35rem;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
