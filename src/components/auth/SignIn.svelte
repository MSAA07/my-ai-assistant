<script>
  import { signIn } from '../../stores/auth';
  import { createEventDispatcher } from 'svelte';
  
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
      error = res.error.message || 'Login failed';
    } else {
        // Success handled by store, but we can emit event to switch view
        dispatch('success');
    }
  }
</script>

<div class="auth-container">
  <h2>Welcome Back</h2>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" type="email" bind:value={email} required placeholder="Enter your email" />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input id="password" type="password" bind:value={password} required placeholder="Enter your password" />
    </div>
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <button type="submit" disabled={loading} class="btn-primary">
      {loading ? 'Logging in...' : 'Login'}
    </button>
  </form>
  <p class="toggle-text">
    Don't have an account? <button class="link-btn" on:click={() => dispatch('toggle')}>Sign Up</button>
  </p>
</div>

<style>
  .auth-container {
    max-width: 400px;
    margin: 4rem auto;
    padding: 2.5rem;
    background: var(--color-surface);
    border-radius: var(--radius-2);
    box-shadow: var(--shadow-panel);
    border: 1px solid var(--color-border-light);
  }
  
  h2 {
    margin-bottom: 2rem;
    text-align: center;
    color: var(--color-text);
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--color-text-secondary);
  }
  
  input {
    width: 100%;
    padding: 0.8rem;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border-light);
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    font-size: 1rem;
  }
  
  input:focus {
    outline: none;
    border-color: var(--color-accent);
  }
  
  .btn-primary {
    width: 100%;
    padding: 0.8rem;
    background: var(--color-accent);
    color: var(--color-text-soft);
    border: none;
    border-radius: var(--radius-1);
    font-size: 1rem;
    cursor: pointer;
    font-weight: 600;
    transition: background var(--motion-fast) var(--ease-standard);
  }
  
  .btn-primary:hover:not(:disabled) {
    background: var(--color-accent-hover);
  }
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .error {
    color: var(--color-danger);
    background: var(--color-danger-surface);
    padding: 0.75rem;
    border-radius: var(--radius-1);
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .toggle-text {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }
  
  .link-btn {
    background: none;
    border: none;
    color: var(--color-accent);
    cursor: pointer;
    text-decoration: underline;
    font-size: 0.9rem;
    padding: 0;
  }
</style>
