<script>
  import { createEventDispatcher } from 'svelte';
  import LanguageToggle from '../ui/LanguageToggle.svelte';
  import { onDestroy } from 'svelte';
  import { t } from '../../i18n/t.js';

  export let pageTitle = '';
  export let user = { name: '', email: '', avatarUrl: '' };
  export let notificationCount = 0;

  const dispatch = createEventDispatcher();
  let menuOpen = false;
  let profileMenu;

  const initials = () => {
    if (user?.avatarUrl) {
      return '';
    }

    const name = user?.name ?? user?.email ?? '';
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  const emit = (type) => {
    dispatch(type, { user });
    closeMenu();
  };

  const toggleMenu = () => {
    menuOpen = !menuOpen;
  };

  const closeMenu = () => {
    menuOpen = false;
  };

  const handleFocusOut = (event) => {
    if (!profileMenu?.contains(event.relatedTarget)) {
      closeMenu();
    }
  };

  const handleKey = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeMenu();
    }
  };

  const handleDocumentClick = (event) => {
    if (menuOpen && profileMenu && !profileMenu.contains(event.target)) {
      closeMenu();
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleDocumentClick);
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleDocumentClick);
    }
  });
</script>

<header class="topbar">
  <div class="topbar__title">
    <slot name="title">{pageTitle}</slot>
  </div>

  <div class="topbar__actions">
    <LanguageToggle compact />
    <button
      type="button"
      class="topbar__icon"
      on:click={() => emit('notifications')}
      aria-label={t('topbar.notifications')}
    >
      <span class="topbar__bell" aria-hidden="true">🔔</span>
      {#if notificationCount > 0}
        <span class="topbar__badge">{notificationCount}</span>
      {/if}
    </button>
    <div class="topbar__profile" bind:this={profileMenu} on:focusout={handleFocusOut}>
      <button
        type="button"
        class="topbar__avatar"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        on:click={toggleMenu}
        on:keydown={handleKey}
      >
        {#if user?.avatarUrl}
          <img src={user.avatarUrl} alt={user?.name ?? user?.email ?? ''} />
        {:else}
          <span>{initials()}</span>
        {/if}
      </button>
      <div class:open={menuOpen} class="topbar__menu" role="menu">
        <button type="button" role="menuitem" on:click={() => emit('profile')}>
          {user?.name || user?.email || t('topbar.profile')}
        </button>
        <button type="button" role="menuitem" on:click={() => emit('logout')}>
          {t('topbar.logout')}
        </button>
      </div>
    </div>
  </div>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: 0 var(--space-5);
    min-block-size: var(--size-topbar);
    background: color-mix(in srgb, var(--color-bg) 80%, transparent);
    backdrop-filter: blur(16px);
    border-block-end: 1px solid var(--color-border);
  }

  .topbar__title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .topbar__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .topbar__icon {
    position: relative;
    min-inline-size: 44px;
    min-block-size: 44px;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background: var(--color-surface-1);
    color: var(--color-text-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }

  .topbar__icon:hover,
  .topbar__icon:focus-visible {
    background: var(--color-surface-2);
    border-color: var(--color-accent-primary);
    outline: none;
  }

  .topbar__bell {
    font-size: 1.1rem;
  }

  .topbar__badge {
    position: absolute;
    top: 6px;
    inline-size: 18px;
    block-size: 18px;
    border-radius: 999px;
    background: var(--color-danger);
    color: #fff;
    font-size: 0.65rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .topbar__profile {
    position: relative;
  }

  .topbar__avatar {
    inline-size: 44px;
    block-size: 44px;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-1);
    cursor: pointer;
    transition: border-color var(--motion-fast) var(--ease-standard);
  }

  .topbar__avatar:hover,
  .topbar__avatar:focus-visible {
    border-color: var(--color-accent-primary);
    outline: none;
  }

  .topbar__avatar img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    border-radius: inherit;
  }

  .topbar__avatar span {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .topbar__menu {
    position: absolute;
    inset-block-start: calc(100% + var(--space-2));
    inset-inline-end: 0;
    min-inline-size: 160px;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-2);
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    background: var(--color-surface-1);
    box-shadow: 0 16px 40px color-mix(in srgb, var(--color-bg) 60%, transparent);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px);
    transition: opacity var(--motion-fast) var(--ease-standard),
      visibility var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-standard);
  }

  .topbar__menu button {
    min-block-size: 40px;
    border: none;
    border-radius: var(--radius-1);
    background: transparent;
    color: var(--color-text-muted);
    text-align: start;
    padding: 0 var(--space-2);
    cursor: pointer;
  }

  .topbar__menu button:hover,
  .topbar__menu button:focus-visible {
    color: var(--color-text-primary);
    background: var(--color-surface-2);
    outline: none;
  }

  .topbar__menu.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    z-index: 20;
  }

  @media (max-width: 640px) {
    .topbar {
      padding-inline: var(--space-3);
    }
  }

  :global(html[dir='rtl']) .topbar {
    border-block-end: 1px solid var(--color-border);
  }

  :global(html[dir='rtl']) .topbar__menu {
    inset-inline-start: 0;
    inset-inline-end: auto;
  }
</style>
