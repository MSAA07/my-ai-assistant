<script>
  import { signUp } from '../../stores/auth';
  import { createEventDispatcher } from 'svelte';
  
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
    } else {
        dispatch('success');
    }
  }
</script>

<div class="auth-container">
  <h2>Create Account</h2>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="name">Full Name</label>
      <input id="name" type="text" bind:value={name} required placeholder="Enter your name" />
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" type="email" bind:value={email} required placeholder="Enter your email" />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input id="password" type="password" bind:value={password} required placeholder="Choose a password (min 8 chars)" minlength="8" />
    </div>
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <button type="submit" disabled={loading} class="btn-primary">
      {loading ? 'Creating Account...' : 'Sign Up'}
    </button>
  </form>
  <p class="toggle-text">
    Already have an account? <button class="link-btn" on:click={() => dispatch('toggle')}>Login</button>
  </p>
</div>

<style>
  /* Use same styles as SignIn.svelte */
  .auth-container {
    max-width: 400px;
    margin: 4rem auto;
    padding: 2.5rem;
    background: var(--color-surface);
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
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
    color: var(--color-text-secondary, #ccc);
  }
  
  input {
    width: 100%;
    padding: 0.8rem;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(0,0,0,0.2);
    color: white;
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
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #4a90e2;
  }
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .error {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .toggle-text {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.9rem;
    color: #888;
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
