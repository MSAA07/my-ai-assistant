<script>
  import AppHeader from './components/AppHeader.svelte';
  import Footer from './components/Footer.svelte';
  import Landing from './pages/Landing.svelte';
  import Home from './pages/Home.svelte';
  import DocumentView from './pages/DocumentView.svelte';
  import SignIn from './components/auth/SignIn.svelte';
  import SignUp from './components/auth/SignUp.svelte';
  import AdminDashboard from './components/AdminDashboard.svelte';
  import { currentPath } from './stores/router.js';
  import { session, isLoading } from './stores/auth.js';
  import './styles/global.css';

  $: route = $currentPath;
  $: isAuthenticated = !!$session;
  $: isAdmin = $session?.user?.role === 'admin';
  let showSignUp = false;

  function toggleAuthMode() {
    showSignUp = !showSignUp;
  }
</script>

{#if $isLoading}
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>Loading session...</p>
  </div>
{:else}
  {#if route === '/' || route === ''}
    <Landing />
  {:else}
    <div class="app-layout">
      <AppHeader />
      <main class="content">
        {#if !isAuthenticated}
          {#if showSignUp}
            <SignUp on:success={() => showSignUp = false} on:toggle={toggleAuthMode} />
          {:else}
            <SignIn on:success={() => {}} on:toggle={toggleAuthMode} />
          {/if}
        {:else if route === '/app'}
          <Home />
        {:else if route === '/admin'}
          {#if isAdmin}
            <AdminDashboard />
          {:else}
            <div class="access-denied">
              <h1>Access Denied</h1>
              <p>You do not have permission to view the admin dashboard.</p>
              <a href="#/app">Back to dashboard</a>
            </div>
          {/if}
        {:else if route.startsWith('/document/')}
          <DocumentView documentId={route.replace('/document/', '')} />
        {:else}
          <div class="not-found">
            <h1>404</h1>
            <p>Page not found.</p>
            <a href="#/">Back to home</a>
          </div>
        {/if}
      </main>

      <Footer />
    </div>
  {/if}
{/if}

<style>
  .loading-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    color: var(--color-text);
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    border-top-color: var(--color-accent);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--color-bg);
    background-image: var(--gradient-bg-radial);
  }
/* ... rest of existing styles ... */

  .content {
    flex: 1;
    padding: 2rem;
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .not-found {
    text-align: center;
    padding: 6rem 1rem;
  }

  .access-denied {
    text-align: center;
    padding: 6rem 1rem;
  }

  .access-denied h1 {
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .access-denied p {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    margin: 0.75rem 0 2rem;
  }

  .access-denied a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-accent);
    font-weight: 500;
    padding: 0.5rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .access-denied a:hover {
    background: var(--color-accent-bg);
    border-color: var(--color-accent);
  }

  .not-found h1 {
    font-size: 5rem;
    font-weight: 800;
    margin: 0;
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .not-found p {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0.75rem 0 2rem;
  }

  .not-found a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-accent);
    font-weight: 500;
    padding: 0.5rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .not-found a:hover {
    background: var(--color-accent-bg);
    border-color: var(--color-accent);
  }

  @media (max-width: 640px) {
    .content {
      padding: 1rem;
    }
  }
</style>
