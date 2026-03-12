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
      <Badge className="plan-pill" tone="success" size="sm">{planLabel}</Badge>
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
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-surface-overlay) 92%, white 8%) 0%,
      var(--color-surface-overlay) 100%
    );
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-panel);
  }

  .topbar h1 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-text-primary);
  }

  .topbar-right {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  :global(.plan-pill) {
    font-size: 0.8rem;
  }

  :global(.icon-button) {
    width: 44px;
    height: 44px;
    padding: 0;
  }

  :global(.icon-button .ui-button__label) {
    display: none;
  }

  :global(.icon-button svg) {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  .avatar-wrapper {
    position: relative;
  }

  :global(.avatar-button) {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border-color: color-mix(in srgb, var(--color-accent-primary) 36%, transparent);
    background: var(--color-accent-surface);
    color: var(--color-accent-primary);
  }

  :global(.avatar-button:hover:not(:disabled)),
  :global(.avatar-button[aria-expanded='true']) {
    border-color: color-mix(in srgb, var(--color-accent-primary) 56%, transparent);
    box-shadow: 0 0 0 1px var(--color-accent-primary) inset;
    background: color-mix(in srgb, var(--color-accent-primary) 20%, transparent);
  }

  :global(.avatar-button .ui-button__icon),
  :global(.avatar-button .ui-button__spinner) {
    display: none;
  }

  :global(.avatar-button .ui-button__label) {
    line-height: 1;
  }

  .avatar-initials {
    font-weight: 700;
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
      padding: 0 var(--space-3);
    }

    .topbar h1 {
      font-size: 1.05rem;
    }
  }
</style>
