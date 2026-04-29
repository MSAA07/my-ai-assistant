<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { PanelLeftClose, PanelLeftOpen } from '@lucide/svelte';
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
      {#if sidebarCollapsed}
        <PanelLeftOpen size={16} strokeWidth={1.75} aria-hidden="true" />
      {:else}
        <PanelLeftClose size={16} strokeWidth={1.75} aria-hidden="true" />
      {/if}
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
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    min-height: var(--size-topbar);
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-4);
    padding: 0 max(var(--layout-shell-padding-inline), env(safe-area-inset-left))
      0 max(var(--layout-shell-padding-inline), env(safe-area-inset-right));
    border-bottom: 1px solid var(--ui-border-default);
    background: color-mix(in srgb, var(--ui-surface-card) 90%, var(--ui-bg-page) 10%);
    backdrop-filter: blur(10px);
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
    letter-spacing: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-toggle {
    display: inline-flex;
    width: 32px;
    min-height: 32px;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 0;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    background: transparent;
    box-shadow: none;
    color: var(--ui-text-secondary);
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .sidebar-toggle:hover {
    background: var(--ui-surface-ghost);
    color: var(--ui-text-primary);
  }

  .sidebar-toggle:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .sidebar-toggle :global(svg) {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
  }

  .toggle-label {
    display: none;
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
    border-radius: var(--ui-radius-sm);
    border-color: transparent;
    background: color-mix(in srgb, var(--ui-surface-secondary) 82%, transparent);
    color: var(--ui-text-primary);
    letter-spacing: 0;
    font-weight: 500;
  }

  .account-trigger {
    display: inline-flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--ui-surface-secondary) 48%, transparent);
    color: var(--ui-text-muted);
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }

  .account-trigger:hover,
  .account-trigger[aria-expanded='true'] {
    background: var(--ui-surface-ghost);
    color: var(--ui-text-primary);
  }

  .account-trigger:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .account-wrapper {
    position: relative;
  }

  .account-trigger {
    width: 32px;
    height: 32px;
    border-color: color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    background: color-mix(in srgb, var(--card) 78%, var(--muted) 22%);
    color: var(--foreground);
    box-shadow: none;
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
