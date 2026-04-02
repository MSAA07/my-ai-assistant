<script>
  import Footer from './components/Footer.svelte';
  import Landing from './pages/Landing.svelte';
  import SignIn from './components/auth/SignIn.svelte';
  import SignUp from './components/auth/SignUp.svelte';
  import AppHeader from './components/AppHeader.svelte';
  import AppShell from './lib/components/layout/AppShell.svelte';
  import PageLayout from './lib/components/layout/PageLayout.svelte';
  import { currentPath, routeParams as queryParams, router } from './stores/router.js';
  import { session, isLoading, signOut, authMeta } from './stores/auth.js';
  import { t } from './lib/i18n/t.js';
  import { language } from './lib/stores/language.js';
  import {
    DEFAULT_AUTH_PATH,
    LANDING_PATH,
    SIGN_IN_PATH,
    SIGN_UP_PATH,
    resolveRoute,
    getNavRoutes,
    getBottomNavRoutes,
    normalizeAppPath,
    sanitizeRedirectPath,
    isPublicRoutePath,
    isAuthRoutePath,
    needsAdminAccess,
    getNavIdForRoute
  } from './routes.js';
  import './styles/global.css';

  const useAppShell = import.meta.env.VITE_FEATURE_APPSHELL !== 'false';

  const AUTH_NOTICE_KEYS = {
    signed_out: 'auth.notices.signedOut',
    session_expired: 'auth.notices.sessionExpired',
  };

  $: rawPath = $currentPath;
  $: params = $queryParams;
  $: normalizedPath = normalizeAppPath(rawPath);
  $: shouldNormalizePath = rawPath !== normalizedPath;
  $: if (shouldNormalizePath && typeof window !== 'undefined') {
    router.replace(normalizedPath);
  }

  $: isAuthenticated = !!$session;
  $: bootstrapPending = $isLoading || $authMeta?.bootstrapPending;
  $: isAdmin = $session?.user?.role?.toLowerCase() === 'admin';
  $: plan = $session?.user?.plan ?? 'free';
  $: isPaidPlan = plan === 'pro' || plan === 'premium';
  $: locale = $language;
  $: planLabel = locale && (isPaidPlan ? t('nav.proBadge') : t('nav.freeBadge'));
  $: isPublicRoute = isPublicRoutePath(normalizedPath);
  $: isAuthRoute = isAuthRoutePath(normalizedPath);
  $: redirectTarget = sanitizeRedirectPath(params.redirect) ?? DEFAULT_AUTH_PATH;
  $: authNoticeKey = AUTH_NOTICE_KEYS[params.reason] ?? '';

  $: routeMatch = resolveRoute(normalizedPath);
  $: activeRoute = routeMatch?.route;
  $: routeParams = routeMatch?.params ?? {};
  $: routeRequiresAdmin = needsAdminAccess(activeRoute);
  $: routeAccessDenied = !!activeRoute && routeRequiresAdmin && !isAdmin;
  $: componentProps = routeAccessDenied ? {} : routeParams;
  $: ActiveComponent = routeAccessDenied ? null : activeRoute?.component ?? null;
  $: activeNav = activeRoute ? getNavIdForRoute(activeRoute) : '';
  $: pageTitle = locale && (routeAccessDenied
    ? t('access.deniedTitle')
    : activeRoute?.pageTitleKey
      ? t(activeRoute.pageTitleKey)
      : t('topbar.defaultTitle'));

  $: shouldRedirectUnauthenticated = !bootstrapPending && !isAuthenticated && !isPublicRoute;
  $: shouldRedirectAuthenticated = !bootstrapPending && isAuthenticated && (normalizedPath === LANDING_PATH || isAuthRoute);
  $: protectedRedirectTarget = `${SIGN_IN_PATH}?${new URLSearchParams({ redirect: normalizedPath }).toString()}`;
  $: if (shouldRedirectUnauthenticated && typeof window !== 'undefined') {
    router.replace(protectedRedirectTarget);
  }

  $: if (shouldRedirectAuthenticated && typeof window !== 'undefined') {
    router.replace(redirectTarget);
  }

  $: navRoutes = getNavRoutes({ includeAdmin: isAdmin });
  $: navItems = locale && navRoutes.map((route) => ({
    id: route.id,
    labelKey: route.labelKey,
    label: t(route.labelKey),
    href: `#${route.path}`,
    icon: route.icon,
    badge: route.comingSoon
      ? { label: t('common.comingSoonBadge'), variant: 'info' }
      : undefined
  }));

  $: bottomNavRoutes = getBottomNavRoutes({ includeAdmin: isAdmin });
  $: bottomNavItems = locale && bottomNavRoutes.map((route) => ({
    id: route.id,
    labelKey: route.labelKey,
    label: t(route.labelKey),
    href: `#${route.path}`,
    icon: route.icon,
    badge: route.comingSoon
      ? { label: t('common.comingSoonBadge'), variant: 'info' }
      : undefined
  }));

  $: secondaryItems = locale && [
    {
      id: 'plan',
      labelKey: 'nav.plan',
      label: t('nav.plan'),
      href: '#/settings',
      icon: 'plan',
      badge: {
        label: planLabel,
        variant: isPaidPlan ? 'success' : ''
      }
    }
  ];
</script>

{#key $language}
  {#if bootstrapPending || shouldRedirectUnauthenticated || shouldRedirectAuthenticated}
    <div class="loading-screen">
      <div class="spinner"></div>
      <p>{t('app.loadingSession')}</p>
    </div>
  {:else}
    {#if !isAuthenticated && normalizedPath === LANDING_PATH}
      <div class="landing-wrapper">
        <Landing />
        <Footer />
      </div>
    {:else if !isAuthenticated && isAuthRoute}
      <div class="auth-wrapper">
        {#if normalizedPath === SIGN_UP_PATH}
          <SignUp notice={authNoticeKey ? t(authNoticeKey) : ''} redirectTarget={redirectTarget} />
        {:else}
          <SignIn notice={authNoticeKey ? t(authNoticeKey) : ''} redirectTarget={redirectTarget} />
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
          <PageLayout class="access-denied" width="narrow">
            <h1>{t('access.deniedTitle')}</h1>
            <p>{t('access.deniedMessage')}</p>
            <a href="#/home">{t('access.backToDashboard')}</a>
          </PageLayout>
        {:else if ActiveComponent}
          <svelte:component this={ActiveComponent} {...componentProps} />
        {:else}
          <PageLayout class="not-found" width="narrow">
            <h1>404</h1>
            <p>{t('errors.notFoundTitle')}</p>
            <a href="#/home">{t('errors.notFoundCta')}</a>
          </PageLayout>
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
              <a href="#/home">{t('access.backToDashboard')}</a>
            </div>
          {:else if ActiveComponent}
            <svelte:component this={ActiveComponent} {...componentProps} />
          {:else}
            <div class="not-found">
              <h1>404</h1>
              <p>{t('errors.notFoundTitle')}</p>
              <a href="#/home">{t('errors.notFoundCta')}</a>
            </div>
          {/if}
        </main>
        <Footer />
      </div>
    {/if}
  {/if}
{/key}

<style>
  .loading-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    background: var(--color-bg);
    color: var(--color-text-primary);
  }

  .spinner {
    width: 26px;
    height: 26px;
    border: 2px solid var(--ui-border-subtle);
    border-radius: 50%;
    border-top-color: var(--color-text-secondary);
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
    background: var(--color-bg);
    display: flex;
    flex-direction: column;
  }

  .auth-wrapper {
    align-items: center;
    justify-content: center;
    padding: var(--space-7) var(--space-3);
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
    font-size: 2.4rem;
    margin: 0;
    color: var(--color-text-primary);
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
    color: var(--color-text-primary);
    font-weight: 600;
    padding: 0.65rem 1.5rem;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .access-denied a:hover,
  .not-found a:hover {
    border-color: var(--ui-border-strong);
    background: rgba(255, 255, 255, 0.04);
  }

  @media (max-width: 640px) {
    .content {
      padding: var(--space-3);
    }
  }
</style>
