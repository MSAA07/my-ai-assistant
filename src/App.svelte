<script>
  import AppShell from './lib/components/layout/AppShell.svelte';
  import EmptyState from './lib/components/ui/EmptyState.svelte';
  import Landing from './pages/Landing.svelte';
  import Home from './pages/Home.svelte';
  import DocumentView from './pages/DocumentView.svelte';
  import SignIn from './components/auth/SignIn.svelte';
  import SignUp from './components/auth/SignUp.svelte';
  import AdminDashboard from './components/AdminDashboard.svelte';
  import Footer from './components/Footer.svelte';
  import { currentPath, routeParams, router } from './stores/router.js';
  import { session, isLoading, signOut } from './stores/auth.js';
  import { t } from './lib/i18n/t.js';
  import { currentDictionary } from './lib/stores/language.js';
  import './styles/global.css';

  const NAV_IDS = ['dashboard', 'documents', 'exams', 'flashcards'];

  let showSignUp = false;
  let notifications = 0;

  $: route = $currentPath;
  $: params = $routeParams;
  $: dictionary = $currentDictionary;
  $: isAuthenticated = !!$session;
  $: isAdmin = $session?.user?.role === 'admin';
  $: activeNav = deriveActiveNav(route, params.section);
  $: navItems = buildPrimaryNav(isAdmin, dictionary);
  $: mobileNav = navItems.filter((item) => item.id !== 'admin');
  $: secondaryNav = [{ id: 'settings', label: navLabel('settings', dictionary), href: '/app?section=settings' }];
  $: planVariant = ($session?.user?.plan ?? 'free').toLowerCase() === 'pro' ? 'pro' : 'free';
  $: planConfig = {
    label: dictionary?.nav?.plan ?? t('nav.plan'),
    badge: planVariant === 'pro'
      ? dictionary?.plan?.pro ?? t('plan.pro')
      : dictionary?.plan?.free ?? t('plan.free'),
    variant: planVariant,
  };
  $: pageTitle = getPageTitle(route, activeNav, dictionary);

  function deriveActiveNav(path, section) {
    if (path.startsWith('/document/')) return 'documents';
    if (path === '/admin') return 'admin';
    if (path === '/app') return section || 'dashboard';
    return 'dashboard';
  }

  function navHref(id) {
    if (id === 'dashboard') return '/app';
    if (id === 'admin') return '/admin';
    return `/app?section=${id}`;
  }

  function navLabel(id, dict = dictionary) {
    const navSection = dict?.nav ?? {};
    switch (id) {
      case 'dashboard':
        return navSection.dashboard ?? t('nav.dashboard');
      case 'documents':
        return navSection.documents ?? t('nav.documents');
      case 'exams':
        return navSection.exams ?? t('nav.exams');
      case 'flashcards':
        return navSection.flashcards ?? t('nav.flashcards');
      case 'settings':
        return navSection.settings ?? t('nav.settings');
      case 'admin':
        return navSection.admin ?? t('nav.admin');
      default:
        return '';
    }
  }

  function buildPrimaryNav(includeAdmin, dict) {
    const base = NAV_IDS.map((id) => ({
      id,
      label: navLabel(id, dict),
      href: navHref(id),
    }));

    return includeAdmin
      ? [...base, { id: 'admin', label: navLabel('admin', dict), href: navHref('admin') }]
      : base;
  }

  function getPageTitle(path, id, dict) {
    const navSection = dict?.nav ?? {};

    if (path.startsWith('/document/')) {
      return navSection.documents ?? t('nav.documents');
    }

    switch (id) {
      case 'dashboard':
        return navSection.dashboard ?? t('nav.dashboard');
      case 'documents':
        return navSection.documents ?? t('nav.documents');
      case 'exams':
        return navSection.exams ?? t('nav.exams');
      case 'flashcards':
        return navSection.flashcards ?? t('nav.flashcards');
      case 'settings':
        return navSection.settings ?? t('nav.settings');
      case 'admin':
        return navSection.admin ?? t('nav.admin');
      default:
        return navSection.dashboard ?? t('nav.dashboard');
    }
  }

  function handleNavigate(event) {
    const item = event.detail?.item;
    if (!item) return;
    if (item.href) {
      router.navigate(item.href);
    }
  }

  function handleTopbar(event) {
    if (event.type === 'logout') {
      signOut();
    }
  }

  function toggleAuthMode() {
    showSignUp = !showSignUp;
  }

  function placeholderSubtitle(id) {
    const subtitle = dictionary?.emptyState?.subtitle ?? t('emptyState.subtitle');
    switch (id) {
      case 'documents':
      case 'exams':
      case 'flashcards':
      case 'settings':
        return subtitle;
      default:
        return subtitle;
    }
  }
</script>

{#if $isLoading}
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>{t('loading.session')}</p>
  </div>
{:else if route === '/' || route === ''}
  <div class="landing-shell">
    <Landing />
    <Footer />
  </div>
{:else if !isAuthenticated}
  <div class="auth-layout">
    {#if showSignUp}
      <SignUp on:success={() => (showSignUp = false)} on:toggle={toggleAuthMode} />
    {:else}
      <SignIn on:success={() => {}} on:toggle={toggleAuthMode} />
    {/if}
  </div>
{:else}
  <AppShell
    pageTitle={pageTitle}
    primaryNav={navItems}
    secondaryNav={secondaryNav}
    mobileNav={mobileNav}
    activeId={activeNav}
    plan={planConfig}
    notificationCount={notifications}
    user={$session?.user ?? {}}
    on:navigate={handleNavigate}
    on:logout={handleTopbar}
    on:notifications={handleTopbar}
    on:profile={handleTopbar}
  >
    {#if route.startsWith('/document/')}
      <DocumentView documentId={route.replace('/document/', '')} />
    {:else if route === '/admin'}
      {#if isAdmin}
        <AdminDashboard />
      {:else}
        <section class="status-block">
          <h1>{t('errors.accessDeniedTitle')}</h1>
          <p>{t('errors.accessDeniedDescription')}</p>
          <a class="status-block__link" href="#/app">{t('actions.backToDashboard')}</a>
        </section>
      {/if}
    {:else if route === '/app'}
      {#if activeNav === 'dashboard'}
        <Home />
      {:else}
        <EmptyState title={navLabel(activeNav)} subtitle={placeholderSubtitle(activeNav)} />
      {/if}
    {:else}
      <section class="status-block">
        <h1>{t('errors.notFoundTitle')}</h1>
        <p>{t('errors.notFoundDescription')}</p>
        <a class="status-block__link" href="#/">{t('actions.backToHome')}</a>
      </section>
    {/if}
  </AppShell>
{/if}

<style>
  .loading-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    background: var(--color-bg);
    color: var(--color-text-primary);
  }

  .spinner {
    inline-size: 42px;
    block-size: 42px;
    border-radius: 999px;
    border: 3px solid color-mix(in srgb, var(--color-text-muted) 20%, transparent);
    border-top-color: var(--color-accent-primary);
    animation: spin var(--motion-normal) var(--ease-standard) infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .landing-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--color-bg);
  }

  .auth-layout {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: var(--space-6) var(--space-3);
    background: var(--color-bg);
  }

  .status-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-3);
    padding: var(--space-6);
    border-radius: var(--radius-2);
    border: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-surface-1) 92%, transparent);
  }

  .status-block h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3rem);
    color: var(--color-text-primary);
  }

  .status-block p {
    margin: 0;
    color: var(--color-text-muted);
    max-inline-size: 440px;
  }

  .status-block__link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 160px;
    min-block-size: 44px;
    padding: 0 var(--space-3);
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
    background: var(--color-surface-1);
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }

  .status-block__link:hover,
  .status-block__link:focus-visible {
    background: var(--color-surface-2);
    border-color: var(--color-accent-primary);
    outline: none;
  }
</style>
