<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { t } from '../../lib/i18n/t.js';
  import { signIn } from '../../stores/auth';

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    loading = true;
    error = '';

    const res = await signIn(email, password);
    loading = false;

    if (res.error) {
      error = res.error.message || t('auth.signIn.errors.failed');
      return;
    }

    dispatch('success');
  }
</script>

<Card class="auth-card" variant="raised" padding="lg" border="subtle">
  <header class="auth-header">
    <p class="auth-eyebrow">{t('auth.signIn.eyebrow')}</p>
    <h2>{t('auth.signIn.title')}</h2>
    <p>{t('auth.signIn.subtitle')}</p>
  </header>

  <form class="auth-form" on:submit|preventDefault={handleSubmit}>
    <FieldShell label={t('auth.fields.email')} forId="email">
      <input id="email" type="email" bind:value={email} required placeholder={t('auth.signIn.placeholders.email')} />
    </FieldShell>

    <FieldShell label={t('auth.fields.password')} forId="password">
      <input id="password" type="password" bind:value={password} required placeholder={t('auth.signIn.placeholders.password')} />
    </FieldShell>

    {#if error}
      <p class="auth-error">{error}</p>
    {/if}

    <Button type="submit" variant="primary" loading={loading} block>
      {loading ? t('auth.signIn.actions.loading') : t('auth.signIn.actions.submit')}
    </Button>
  </form>

  <p class="toggle-text">
    {t('auth.signIn.switch.prompt')}
    <Button type="button" variant="ghost" size="sm" className="link-btn" on:click={() => dispatch('toggle')}>
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

  .auth-error {
    margin: 0;
    border: 1px solid var(--color-danger-border);
    border-radius: var(--ui-radius-md);
    background: var(--color-danger-surface);
    color: var(--color-danger-soft);
    padding: 0.65rem 0.8rem;
    font-size: var(--font-size-sm);
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
