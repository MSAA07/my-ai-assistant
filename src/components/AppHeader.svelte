<script>
  import { currentPath } from "../stores/router.js";
  import { session, signOut } from "../stores/auth.js";
  
  async function handleLogout() {
    await signOut();
  }
</script>

<header class="app-header">
  <div class="header-content">
    <a href="#/" class="logo">AI Study Assistant</a>
    
    {#if $session}
      <div class="user-nav">
        {#if $session.user.role === 'admin'}
            <a href="#/admin" class="nav-link">Admin</a>
        {/if}
        <span class="user-name">{$session.user.name}</span>
        <button class="logout-btn" on:click={handleLogout}>Logout</button>
      </div>
    {/if}
  </div>
</header>

<style>
  .app-header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between; /* Changed from center */
    align-items: center;
  }
  
  .user-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .nav-link {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
  }
  
  .nav-link:hover {
    color: var(--color-accent);
  }
  
  .user-name {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }
  
  .logout-btn {
    background: rgba(255,255,255,0.1);
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .logout-btn:hover {
    background: rgba(255,255,255,0.2);
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 800;
    text-decoration: none;
    color: var(--color-text);
  }

  @media (max-width: 640px) {
    .header-content {
      padding: 0 1rem;
    }

    .logo {
      font-size: 1.25rem;
    }
  }
</style>
