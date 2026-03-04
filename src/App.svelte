<script>
  import Footer from './components/Footer.svelte';
  import Landing from './pages/Landing.svelte';
  import SignIn from './components/auth/SignIn.svelte';
  import SignUp from './components/auth/SignUp.svelte';
  import AppHeader from './components/AppHeader.svelte';
  import AppShell from './lib/components/layout/AppShell.svelte';
  import { currentPath } from './stores/router.js';
  import { session, isLoading, signOut } from './stores/auth.js';
  import { t } from './lib/i18n/t.js';
  import {
    DEFAULT_AUTH_PATH,
    resolveRoute,
    getNavRoutes,
    getBottomNavRoutes,
    normalizeAppPath,
    needsAdminAccess,
    getNavIdForRoute
  } from './routes.js';
  import './styles/global.css';

  const useAppShell = import.meta.env.VITE_FEATURE_APPSHELL !== 'false';
  let showSignUp = false;

  $: rawPath = $currentPath;
  $: normalizedPath = normalizeAppPath(rawPath);
  $: shouldRedirect = rawPath !== normalizedPath && normalizedPath !== '/';
  $: if (shouldRedirect && typeof window !== 'undefined') {
    window.location.hash = normalizedPath;
  }

  $: isAuthenticated = !!$session;
  $: isAdmin = $session?.user?.role === 'admin';
  $: plan = $session?.user?.plan ?? 'free';
  $: isPaidPlan = plan === 'pro' || plan === 'premium';
  $: planLabel = isPaidPlan ? t('nav.proBadge') : t('nav.freeBadge');

  $: routeMatch = resolveRoute(normalizedPath);
  $: activeRoute = routeMatch?.route;
  $: routeParams = routeMatch?.params ?? {};
  $: routeRequiresAdmin = needsAdminAccess(activeRoute);
  $: routeAccessDenied = !!activeRoute && routeRequiresAdmin && !isAdmin;
  $: componentProps = routeAccessDenied ? {} : routeParams;
  $: ActiveComponent = routeAccessDenied ? null : activeRoute?.component ?? null;
  $: activeNav = activeRoute ? getNavIdForRoute(activeRoute) : '';
  $: pageTitle = routeAccessDenied
    ? t('access.deniedTitle')
    : activeRoute?.pageTitleKey
      ? t(activeRoute.pageTitleKey)
      : t('topbar.defaultTitle');

  $: if (isAuthenticated && normalizedPath === '/' && typeof window !== 'undefined') {
    window.location.hash = DEFAULT_AUTH_PATH;
  }

  $: navRoutes = getNavRoutes({ includeAdmin: isAdmin });
  $: navItems = navRoutes.map((route) => ({
    id: route.id,
    label: t(route.labelKey),
    href: `#${route.path}`,
    icon: route.icon,
    badge: route.comingSoon
      ? { label: t('common.comingSoonBadge'), variant: 'info' }
      : undefined
  }));

  $: bottomNavRoutes = getBottomNavRoutes({ includeAdmin: isAdmin });
  $: bottomNavItems = bottomNavRoutes.map((route) => ({
    id: route.id,
    label: t(route.labelKey),
    href: `#${route.path}`,
    icon: route.icon,
    badge: route.comingSoon
      ? { label: t('common.comingSoonBadge'), variant: 'info' }
      : undefined
  }));

  $: secondaryItems = [
    {
      id: 'plan',
      label: t('nav.plan'),
      href: '#/settings',
      icon: 'plan',
      badge: {
        label: planLabel,
        variant: isPaidPlan ? 'success' : ''
      }
    }
  ];

  function toggleAuthMode() {
    showSignUp = !showSignUp;
  }
</script>

{#if $isLoading}
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>{t('app.loadingSession')}</p>
  </div>
{:else}
  {#if normalizedPath === '/'}
    <div class="landing-wrapper">
      <Landing />
      <Footer />
    </div>
  {:else if !isAuthenticated}
    <div class="auth-wrapper">
      {#if showSignUp}
        <SignUp on:success={() => (showSignUp = false)} on:toggle={toggleAuthMode} />
      {:else}
        <SignIn on:success={() => {}} on:toggle={toggleAuthMode} />
      {/if}
    </div>
  {:else if useAppShell}
    <AppShell
      navItems={navItems}
      secondaryItems={secondaryItems}
      activeNav={activeNav}
      pageTitle={pageTitle}
      userName={$session?.user?.name ?? ''}
      userEmail={$session?.user?.email ?? ''}
      planLabel={planLabel}
      bottomNavItems={bottomNavItems}
      on:signOut={signOut}
    >
      {#if routeAccessDenied}
        <div class="access-denied">
          <h1>{t('access.deniedTitle')}</h1>
          <p>{t('access.deniedMessage')}</p>
          <a href="#/dashboard">{t('access.backToDashboard')}</a>
        </div>
      {:else if ActiveComponent}
        <svelte:component this={ActiveComponent} {...componentProps} />
      {:else}
        <div class="not-found">
          <h1>404</h1>
          <p>{t('errors.notFoundTitle')}</p>
          <a href="#/dashboard">{t('errors.notFoundCta')}</a>
        </div>
      {/if}
    </AppShell>
  {:else}
    <div class="legacy-layout">
      <AppHeader />
      <main class="content">
        {#if routeAccessDenied}
          <div class="access-denied">
            <h1>{t('access.deniedTitle')}</h1>
            <p>{t('access.deniedMessage')}</p>
            <a href="#/dashboard">{t('access.backToDashboard')}</a>
          </div>
        {:else if ActiveComponent}
          <svelte:component this={ActiveComponent} {...componentProps} />
        {:else}
          <div class="not-found">
            <h1>404</h1>
            <p>{t('errors.notFoundTitle')}</p>
            <a href="#/dashboard">{t('errors.notFoundCta')}</a>
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
    gap: var(--space-3);
    background: var(--color-bg);
    color: var(--color-text-primary);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border);
    border-radius: 50%;
    border-top-color: var(--color-accent-primary);
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .landing-wrapper,
  .auth-wrapper,
  .legacy-layout {
    min-height: 100vh;
    background: var(--gradient-bg-radial), var(--color-bg);
    display: flex;
    flex-direction: column;
  }

  .auth-wrapper {
    align-items: center;
    justify-content: center;
    padding: var(--space-6) var(--space-3);
  }

  .content {
    flex: 1;
    padding: var(--space-5);
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .access-denied,
  .not-found {
    text-align: center;
    padding: 6rem 1rem;
  }

  .access-denied h1,
  .not-found h1 {
    font-size: 3rem;
    margin: 0;
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .access-denied p,
  .not-found p {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    margin: 0.75rem 0 2rem;
  }

  .access-denied a,
  .not-found a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--color-accent-primary);
    font-weight: 600;
    padding: 0.65rem 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .access-denied a:hover,
  .not-found a:hover {
    border-color: var(--color-accent-primary);
    background: var(--color-accent-surface);
  }

  @media (max-width: 640px) {
    .content {
      padding: var(--space-3);
    }
  }
</style>
