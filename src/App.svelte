<script>
  import Footer from './components/Footer.svelte';
  import PublicFooter from './components/public/PublicFooter.svelte';
  import PublicHeader from './components/public/PublicHeader.svelte';
  import Landing from './pages/Landing.svelte';
  import LegalDocument from './pages/LegalDocument.svelte';
  import ForgotPassword from './components/auth/ForgotPassword.svelte';
  import ResetPassword from './components/auth/ResetPassword.svelte';
  import SignIn from './components/auth/SignIn.svelte';
  import SignUp from './components/auth/SignUp.svelte';
  import VerifyEmail from './components/auth/VerifyEmail.svelte';
  import AppHeader from './components/AppHeader.svelte';
  import AppShell from './lib/components/layout/AppShell.svelte';
  import PageLayout from './lib/components/layout/PageLayout.svelte';
  import ToastViewport from './lib/components/ui/ToastViewport.svelte';
  import { API_BASE, getEmailVerificationCallbackUrl } from './config.js';
  import { currentPath, routeParams as queryParams, router } from './stores/router.js';
  import { session, isLoading, signOut, stopImpersonating, authMeta } from './stores/auth.js';
  import { toast } from './stores/toasts.js';
  import { t } from './lib/i18n/t.js';
  import { language } from './lib/stores/language.js';
  import {
    DEFAULT_AUTH_PATH,
    LANDING_PATH,
    FORGOT_PASSWORD_PATH,
    RESET_PASSWORD_PATH,
    SIGN_IN_PATH,
    SIGN_UP_PATH,
    VERIFY_EMAIL_PATH,
    resolveRoute,
    getNavRoutes,
    getBottomNavRoutes,
    normalizeAppPath,
    sanitizeRedirectPath,
    isPublicRoutePath,
    isAuthRoutePath,
    needsAdminAccess,
    getNavIdForRoute,
    isLegalPath
  } from './routes.js';
  import './styles/global.css';

  const useAppShell = import.meta.env.VITE_FEATURE_APPSHELL !== 'false';
  let stoppingImpersonation = false;

  async function handleStopImpersonating() {
    stoppingImpersonation = true;
    const result = await stopImpersonating();
    stoppingImpersonation = false;
    if (result?.error) toast.error(result.error.message || 'Failed to return to the admin session.');
    else toast.success('Returned to your admin session.');
  }

  const AUTH_NOTICE_KEYS = {
    signed_out: 'auth.notices.signedOut',
    session_expired: 'auth.notices.sessionExpired',
    blocked_access: 'auth.notices.blockedAccess',
    password_reset: 'auth.notices.passwordReset',
  };

  function consumeVerificationBridge() {
    if (typeof window === 'undefined') return;

    const search = new URLSearchParams(window.location.search);
    if (search.get('auth_action') !== 'verify-email') {
      return;
    }

    const token = search.get('token');
    if (token) {
      const handoffUrl = new URL(`${API_BASE}/api/auth/verify-email`);
      handoffUrl.searchParams.set('token', token);
      const callbackUrl = getEmailVerificationCallbackUrl();
      handoffUrl.searchParams.set('callbackURL', callbackUrl);

      window.location.replace(handoffUrl.toString());
      return;
    }

    const nextParams = new URLSearchParams();
    nextParams.set('status', search.get('error') ? 'error' : 'success');

    const error = search.get('error');
    if (error) {
      nextParams.set('error', error.toLowerCase());
    }

    const nextPath = `${VERIFY_EMAIL_PATH}?${nextParams.toString()}`;
    router.replace(nextPath);
  }

  function consumeResetPasswordBridge() {
    if (typeof window === 'undefined') return;

    const search = new URLSearchParams(window.location.search);
    if (search.get('auth_action') !== 'reset-password') {
      return;
    }

    const nextParams = new URLSearchParams();
    const token = search.get('token');
    const error = search.get('error');

    if (token) {
      nextParams.set('token', token);
    } else {
      nextParams.set('status', 'error');
      nextParams.set('error', (error || 'invalid_token').toLowerCase());
    }

    const nextPath = `${RESET_PASSWORD_PATH}?${nextParams.toString()}`;
    router.replace(nextPath);
  }

  consumeVerificationBridge();
  consumeResetPasswordBridge();

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
  $: impersonating = Boolean($session?.session?.impersonatedBy);
  $: locale = $language;
  $: isPublicRoute = isPublicRoutePath(normalizedPath);
  $: isAuthRoute = isAuthRoutePath(normalizedPath);
  $: isAuthPage = [
    SIGN_IN_PATH,
    SIGN_UP_PATH,
    FORGOT_PASSWORD_PATH,
    RESET_PASSWORD_PATH,
    VERIFY_EMAIL_PATH
  ].includes(normalizedPath);
  $: redirectTarget = sanitizeRedirectPath(params.redirect) ?? DEFAULT_AUTH_PATH;
  $: authScreenRedirectTarget = isAuthRoute ? redirectTarget : normalizedPath;
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
  $: protectedRedirectReason = $authMeta?.reason === 'blocked_access' ? 'blocked_access' : '';
  $: protectedRedirectParams = new URLSearchParams({
    redirect: normalizedPath,
    ...(protectedRedirectReason ? { reason: protectedRedirectReason } : {}),
  });
  $: protectedRedirectTarget = `${SIGN_IN_PATH}?${protectedRedirectParams.toString()}`;
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

  $: secondaryItems = locale && [];
</script>

{#key $language}
  {#if bootstrapPending}
    <div class="loading-screen">
      <div class="spinner"></div>
      <p>{t('app.loadingSession')}</p>
    </div>
  {:else}
    {#if !isAuthenticated && normalizedPath === LANDING_PATH}
      <div class="public-shell">
        <PublicHeader />
        <Landing />
        <PublicFooter />
      </div>
    {:else if normalizedPath === VERIFY_EMAIL_PATH}
      <div class="public-shell" class:auth-page={isAuthPage}>
        <PublicHeader />
        <main class="auth-wrapper">
          <section class="auth-stage">
            <div class="auth-card-wrap">
              <VerifyEmail
                status={params.status ?? 'pending'}
                email={params.email ?? ''}
                source={params.source ?? ''}
                errorCode={params.error ?? ''}
              />
            </div>
          </section>
        </main>
        {#if !isAuthPage}
          <PublicFooter compact />
        {/if}
      </div>
    {:else if normalizedPath === FORGOT_PASSWORD_PATH}
      <div class="public-shell" class:auth-page={isAuthPage}>
        <PublicHeader />
        <main class="auth-wrapper">
          <section class="auth-stage">
            <div class="auth-card-wrap">
              <ForgotPassword />
            </div>
          </section>
        </main>
        {#if !isAuthPage}
          <PublicFooter compact />
        {/if}
      </div>
    {:else if normalizedPath === RESET_PASSWORD_PATH}
      <div class="public-shell" class:auth-page={isAuthPage}>
        <PublicHeader />
        <main class="auth-wrapper">
          <section class="auth-stage">
            <div class="auth-card-wrap">
              <ResetPassword
                token={params.token ?? ''}
                status={params.status ?? ''}
                errorCode={params.error ?? ''}
              />
            </div>
          </section>
        </main>
        {#if !isAuthPage}
          <PublicFooter compact />
        {/if}
      </div>
    {:else if isLegalPath(normalizedPath)}
      <div class="public-shell">
        <PublicHeader />
        <LegalDocument slug={normalizedPath === '/legal' ? 'privacy-policy' : normalizedPath.replace('/legal/', '')} />
        <PublicFooter />
      </div>
    {:else if !isAuthenticated && (isAuthRoute || shouldRedirectUnauthenticated)}
      <div class="public-shell" class:auth-page={isAuthPage}>
        <PublicHeader />
        <main class="auth-wrapper">
          <section class="auth-stage">
            <div class="auth-card-wrap">
              {#if normalizedPath === SIGN_UP_PATH}
                <SignUp notice={authNoticeKey ? t(authNoticeKey) : ''} redirectTarget={authScreenRedirectTarget} />
              {:else}
                <SignIn notice={authNoticeKey ? t(authNoticeKey) : ''} redirectTarget={authScreenRedirectTarget} />
              {/if}
            </div>
          </section>
        </main>
        {#if !isAuthPage}
          <PublicFooter compact />
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
        bottomNavItems={bottomNavItems}
        {impersonating}
        impersonatedUserName={$session?.user?.name ?? ''}
        impersonatedUserEmail={$session?.user?.email ?? ''}
        {stoppingImpersonation}
        on:signOut={signOut}
        on:stopImpersonating={handleStopImpersonating}
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

<ToastViewport />

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

  .auth-wrapper,
  .public-shell,
  .legacy-layout {
    min-height: 100vh;
    background: var(--color-bg);
    display: flex;
    flex-direction: column;
  }

  .public-shell.auth-page {
    height: 100vh;
    overflow: hidden;
  }

  .auth-wrapper {
    flex: 1;
    width: 100%;
    display: grid;
    place-items: center;
    padding: clamp(2.5rem, 6vw, 5rem) var(--ui-space-4);
  }

  .auth-stage {
    display: grid;
    width: min(440px, 100%);
    justify-items: stretch;
  }

  .auth-card-wrap {
    width: 100%;
    min-width: 0;
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
    .auth-wrapper {
      padding: var(--ui-space-6) var(--ui-space-3);
    }

    .content {
      padding: var(--space-3);
    }
  }
</style>
