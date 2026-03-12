<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { signUp } from '../../stores/auth';

  const dispatch = createEventDispatcher();

  let name = '';
  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    loading = true;
    error = '';

    const res = await signUp(email, password, name);
    loading = false;

    if (res.error) {
      error = res.error.message || 'Signup failed';
      return;
    }

    dispatch('success');
  }
</script>

<Card class="auth-card" variant="raised" padding="lg" border="subtle">
  <header class="auth-header">
    <p class="auth-eyebrow">Create account</p>
    <h2>Create account</h2>
    <p>Set up your profile to start generating study materials.</p>
  </header>

  <form class="auth-form" on:submit|preventDefault={handleSubmit}>
    <FieldShell label="Full Name" forId="name">
      <input id="name" type="text" bind:value={name} required placeholder="Enter your name" />
    </FieldShell>

    <FieldShell label="Email" forId="email">
      <input id="email" type="email" bind:value={email} required placeholder="Enter your email" />
    </FieldShell>

    <FieldShell label="Password" forId="password">
      <input id="password" type="password" bind:value={password} required placeholder="Choose a password (min 8 chars)" minlength="8" />
    </FieldShell>

    {#if error}
      <p class="auth-error">{error}</p>
    {/if}

    <Button type="submit" variant="primary" loading={loading} block>
      {loading ? 'Creating Account...' : 'Sign Up'}
    </Button>
  </form>

  <p class="toggle-text">
    Already have an account?
    <Button type="button" variant="ghost" size="sm" className="link-btn" on:click={() => dispatch('toggle')}>
      Login
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
