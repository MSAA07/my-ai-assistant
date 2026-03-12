<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import LanguageToggle from '../ui/LanguageToggle.svelte';
  import Badge from '../ui/Badge.svelte';
  import Button from '../ui/Button.svelte';
  import MenuItem from '../ui/MenuItem.svelte';
  import MenuSurface from '../ui/MenuSurface.svelte';
  import { ENABLE_ARABIC_UI } from '../../config/features.js';
  import { t } from '../../i18n/t.js';

  export let pageTitle = '';
  export let userName = '';
  export let userEmail = '';
  export let planLabel = '';

  const dispatch = createEventDispatcher();
  let menuOpen = false;
  let avatarWrapper;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function handleOutsideClick(event) {
    if (!menuOpen) return;
    if (avatarWrapper && !avatarWrapper.contains(event.target)) {
      closeMenu();
    }
  }

  function handleSignOut() {
    dispatch('signOut');
    closeMenu();
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
  <div class="topbar-left">
    <h1>{pageTitle || t('topbar.defaultTitle')}</h1>
  </div>

  <div class="topbar-right">
    {#if planLabel}
      <Badge className="plan-pill" tone="neutral" size="sm">{planLabel}</Badge>
    {/if}
    {#if ENABLE_ARABIC_UI}
      <LanguageToggle />
    {/if}

    <Button
      className="icon-button"
      variant="ghost"
      size="icon"
      type="button"
      disabled
      aria-disabled="true"
      title={t('common.comingSoon')}
      aria-label={t('topbar.notificationsComingSoon')}
    >
      <span slot="icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v2.88l-.95 2.86A1.75 1.75 0 0 0 6.69 17h10.62a1.75 1.75 0 0 0 1.64-2.26L18 11.88V9a6 6 0 0 0-6-6Zm0 18a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 21Z" /></svg>
      </span>
    </Button>

    <div class="avatar-wrapper" bind:this={avatarWrapper}>
      <Button
        className="avatar-button"
        variant="ghost"
        size="icon"
        type="button"
        on:click={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <span class="avatar-initials">{initials}</span>
      </Button>

      {#if menuOpen}
        <MenuSurface className="menu" role="menu" minWidth="220px">
          <div class="menu-header">
            <span class="menu-name">{userName}</span>
            <span class="menu-email">{userEmail}</span>
          </div>
          <MenuItem on:click={() => dispatch('openProfile')}>
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
    z-index: 90;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    min-height: var(--size-topbar);
    padding: 0 var(--space-4);
    background: rgba(9, 9, 11, 0.92);
    border-bottom: 1px solid var(--ui-border-subtle);
  }

  .topbar h1 {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--color-text-primary);
  }

  .topbar-right {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  :global(.plan-pill) {
    letter-spacing: 0.02em;
  }

  :global(.icon-button) {
    width: var(--ui-control-height-md);
    height: var(--ui-control-height-md);
    padding: 0;
  }

  :global(.icon-button .ui-button__label) {
    display: none;
  }

  :global(.icon-button svg) {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .avatar-wrapper {
    position: relative;
  }

  :global(.avatar-button) {
    width: var(--ui-control-height-md);
    height: var(--ui-control-height-md);
    border-radius: var(--ui-radius-md);
    border-color: var(--ui-border-subtle);
    background: var(--ui-surface-raised);
    color: var(--color-text-secondary);
  }

  :global(.avatar-button:hover:not(:disabled)),
  :global(.avatar-button[aria-expanded='true']) {
    border-color: var(--ui-border-strong);
    box-shadow: none;
    background: var(--color-surface-3);
    color: var(--color-text-primary);
  }

  :global(.avatar-button .ui-button__icon),
  :global(.avatar-button .ui-button__spinner) {
    display: none;
  }

  :global(.avatar-button .ui-button__label) {
    line-height: 1;
  }

  .avatar-initials {
    font-size: var(--font-size-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  :global(.menu) {
    position: absolute;
    inset-inline-end: 0;
    margin-top: var(--space-2);
    z-index: 20;
  }

  .menu-header {
    padding: var(--space-2);
    border-bottom: 1px solid var(--ui-border-subtle);
    display: grid;
    gap: 0.25rem;
    margin-bottom: var(--space-1);
  }

  .menu-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .menu-email {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  @media (max-width: 768px) {
    .topbar {
      min-height: 52px;
      padding: 0 var(--space-3);
    }

    .topbar h1 {
      font-size: 0.95rem;
    }
  }
</style>
