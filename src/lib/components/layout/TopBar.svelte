<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import LanguageToggle from '../ui/LanguageToggle.svelte';
  import { ENABLE_ARABIC_UI } from '../../config/features.js';
  import { t } from '../../i18n/t.js';

  export let pageTitle = '';
  export let userName = '';
  export let userEmail = '';
  export let planLabel = '';

  const dispatch = createEventDispatcher();
  let menuOpen = false;
  let avatarButton;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function handleOutsideClick(event) {
    if (!menuOpen) return;
    if (avatarButton && !avatarButton.contains(event.target)) {
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
      <span class="plan-pill">{planLabel}</span>
    {/if}
    {#if ENABLE_ARABIC_UI}
      <LanguageToggle />
    {/if}
    <button
      class="icon-button"
      type="button"
      disabled
      aria-disabled="true"
      title={t('common.comingSoon')}
      aria-label={t('topbar.notificationsComingSoon')}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v2.88l-.95 2.86A1.75 1.75 0 0 0 6.69 17h10.62a1.75 1.75 0 0 0 1.64-2.26L18 11.88V9a6 6 0 0 0-6-6Zm0 18a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 21Z" /></svg>
    </button>
    <div class="avatar-wrapper">
      <button
        class="avatar-button"
        type="button"
        on:click={toggleMenu}
        bind:this={avatarButton}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <span class="avatar-initials">{initials}</span>
      </button>

      {#if menuOpen}
        <div class="menu" role="menu">
          <div class="menu-header">
            <span class="menu-name">{userName}</span>
            <span class="menu-email">{userEmail}</span>
          </div>
          <button class="menu-item" role="menuitem" type="button" on:click={() => dispatch('openProfile')}>
            {t('topbar.profile')}
          </button>
          <button class="menu-item" role="menuitem" type="button" on:click={handleSignOut}>
            {t('topbar.logout')}
          </button>
        </div>
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
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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

  .plan-pill {
    padding: 0.25rem 0.7rem;
    border-radius: 999px;
    background: var(--color-success-surface);
    color: var(--color-success);
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid color-mix(in srgb, var(--color-success) 35%, transparent);
  }

  .icon-button {
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-surface-1) 88%, transparent);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .icon-button:hover {
    color: var(--color-text-primary);
    border-color: var(--color-accent-primary);
    background: color-mix(in srgb, var(--color-accent-primary) 16%, transparent);
  }

  .icon-button:disabled {
    opacity: 0.5;
    border-color: var(--color-border);
    cursor: not-allowed;
  }

  .icon-button svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  .avatar-wrapper {
    position: relative;
  }

  .avatar-button {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--color-accent-primary) 36%, transparent);
    background: var(--color-accent-surface);
    color: var(--color-accent-primary);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .avatar-button:hover,
  .avatar-button[aria-expanded="true"] {
    box-shadow: 0 0 0 1px var(--color-accent-primary) inset;
  }

  .menu {
    position: absolute;
    inset-inline-end: 0;
    margin-top: var(--space-2);
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    box-shadow: 0 20px 40px var(--color-shadow);
    min-width: 220px;
    padding: var(--space-2);
    display: grid;
    gap: var(--space-1);
  }

  .menu-header {
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    display: grid;
    gap: 0.25rem;
  }

  .menu-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .menu-email {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  .menu-item {
    width: 100%;
    min-height: 40px;
    padding: 0.5rem var(--space-2);
    border-radius: var(--radius-1);
    border: none;
    background: transparent;
    text-align: start;
    color: var(--color-text-secondary);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .menu-item:hover {
    background: var(--color-surface-2);
    color: var(--color-text-primary);
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
