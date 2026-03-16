<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import LanguageToggle from '../ui/LanguageToggle.svelte';
  import Badge from '../ui/Badge.svelte';
  import MenuItem from '../ui/MenuItem.svelte';
  import MenuSurface from '../ui/MenuSurface.svelte';
  import { ENABLE_ARABIC_UI } from '../../config/features.js';
  import { t } from '../../i18n/t.js';

  export let pageTitle = '';
  export let userName = '';
  export let userEmail = '';
  export let planLabel = '';
  export let sidebarCollapsed = false;

  const dispatch = createEventDispatcher();
  let menuOpen = false;
  let accountWrapper;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function handleOutsideClick(event) {
    if (!menuOpen) return;
    if (accountWrapper && !accountWrapper.contains(event.target)) {
      closeMenu();
    }
  }

  function handleProfile() {
    dispatch('openProfile');
    closeMenu();
  }

  function handleSignOut() {
    dispatch('signOut');
    closeMenu();
  }

  function handleSidebarToggle() {
    dispatch('toggleSidebar');
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleOutsideClick);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('click', handleOutsideClick);
    }
  });

  $: initials = userName
    ? userName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AI';
</script>

<header class="topbar">
  <div class="title-area">
    <button
      class="sidebar-toggle"
      type="button"
      on:click={handleSidebarToggle}
      aria-label={sidebarCollapsed ? t('topbar.expandSidebar') : t('topbar.collapseSidebar')}
      title={sidebarCollapsed ? t('topbar.expandSidebar') : t('topbar.collapseSidebar')}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.75 4A1.75 1.75 0 0 0 3 5.75v12.5A1.75 1.75 0 0 0 4.75 20h14.5A1.75 1.75 0 0 0 21 18.25V5.75A1.75 1.75 0 0 0 19.25 4H4.75Zm4.5 1.5v13h10a.25.25 0 0 0 .25-.25V5.75a.25.25 0 0 0-.25-.25h-10ZM4.75 5.5h3v13h-3a.25.25 0 0 1-.25-.25V5.75c0-.14.11-.25.25-.25Z" />
      </svg>
      <span class="toggle-label">
        {sidebarCollapsed ? t('topbar.expandSidebar') : t('topbar.collapseSidebar')}
      </span>
    </button>

    <h1 class="page-title">{pageTitle || t('topbar.defaultTitle')}</h1>
  </div>

  <div class="utility-area">
    {#if planLabel}
      <Badge className="plan-pill" tone="neutral" size="sm">{planLabel}</Badge>
    {/if}

    {#if ENABLE_ARABIC_UI}
      <LanguageToggle />
    {/if}

    <button
      class="utility-button"
      type="button"
      disabled
      aria-disabled="true"
      aria-label={t('topbar.notificationsComingSoon')}
      title={t('common.comingSoon')}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v2.88l-.95 2.86A1.75 1.75 0 0 0 6.69 17h10.62a1.75 1.75 0 0 0 1.64-2.26L18 11.88V9a6 6 0 0 0-6-6Zm0 18a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 21Z" /></svg>
    </button>

    <div class="account-wrapper" bind:this={accountWrapper}>
      <button
        class="account-trigger"
        type="button"
        on:click|stopPropagation={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={t('topbar.profile')}
      >
        <span class="account-avatar">{initials}</span>
      </button>

      {#if menuOpen}
        <MenuSurface className="account-menu" role="menu" minWidth="220px">
          <div class="menu-header">
            <span class="menu-name">{userName || t('settings.account.anonymous')}</span>
            <span class="menu-email">{userEmail || t('settings.account.noEmail')}</span>
          </div>

          <MenuItem on:click={handleProfile}>
            {t('topbar.profile')}
          </MenuItem>
          <MenuItem on:click={handleSignOut}>
            {t('topbar.logout')}
          </MenuItem>
        </MenuSurface>
      {/if}
    </div>
  </div>
</header>

<style>
  .topbar {
    position: relative;
    z-index: 1;
    display: flex;
    min-height: var(--size-topbar);
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-4);
    padding: 0 var(--layout-shell-padding-inline);
    border-bottom: 1px solid var(--ui-border-default);
    background: color-mix(in srgb, var(--ui-surface-card) 88%, var(--ui-bg-page) 12%);
    backdrop-filter: blur(14px);
  }

  .title-area {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
  }

  .page-title {
    margin: 0;
    min-width: 0;
    color: var(--ui-text-primary);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-toggle {
    display: inline-flex;
    min-height: 34px;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.75rem;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-pill);
    background: color-mix(in srgb, var(--ui-surface-card) 72%, var(--ui-surface-secondary) 28%);
    box-shadow: var(--shadow-inline-control);
    color: var(--ui-text-primary);
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }

  .sidebar-toggle:hover {
    background: var(--ui-surface-ghost);
  }

  .sidebar-toggle:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .sidebar-toggle svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    fill: currentColor;
  }

  .toggle-label {
    white-space: nowrap;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .utility-area {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    flex: 0 0 auto;
  }

  :global(.plan-pill) {
    min-height: 24px;
    padding-inline: 0.625rem;
    border-radius: 999px;
    border-color: transparent;
    background: var(--ui-surface-secondary);
    color: var(--ui-text-primary);
    letter-spacing: 0;
    font-weight: 500;
  }

  .utility-button,
  .account-trigger {
    display: inline-flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-pill);
    background: color-mix(in srgb, var(--ui-surface-secondary) 66%, transparent);
    color: var(--ui-text-muted);
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }

  .utility-button:hover:enabled,
  .account-trigger:hover,
  .account-trigger[aria-expanded='true'] {
    background: var(--ui-surface-ghost);
    color: var(--ui-text-primary);
  }

  .utility-button:disabled {
    cursor: default;
    opacity: 1;
  }

  .utility-button:focus-visible,
  .account-trigger:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .utility-button svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .account-wrapper {
    position: relative;
  }

  .account-trigger {
    width: 34px;
    height: 34px;
    border-color: color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    background: color-mix(in srgb, var(--card) 70%, var(--muted) 30%);
    color: var(--foreground);
    box-shadow: var(--shadow-inline-control);
  }

  .account-avatar {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }

  :global(.account-menu) {
    position: absolute;
    inset-inline-end: 0;
    top: calc(100% + 0.5rem);
    z-index: 40;
  }

  .menu-header {
    display: grid;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
    padding: 0.5rem 0.625rem 0.625rem;
    border-bottom: 1px solid var(--border);
  }

  .menu-name,
  .menu-email {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-name {
    color: var(--foreground);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .menu-email {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  @media (max-width: 767px) {
    .topbar {
      padding:
        0
        max(var(--ui-space-4), env(safe-area-inset-right))
        0
        max(var(--ui-space-4), env(safe-area-inset-left));
      gap: 0.75rem;
    }

    .sidebar-toggle {
      display: none;
    }

    .utility-area {
      gap: 0.5rem;
    }

    :global(.plan-pill) {
      display: none;
    }
  }

  @media (max-width: 1024px) {
    .toggle-label {
      display: none;
    }

    .sidebar-toggle {
      padding-inline: 0.625rem;
    }
  }
</style>
