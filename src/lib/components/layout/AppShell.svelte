<script>
  import { createEventDispatcher } from 'svelte';
  import Sidebar from './Sidebar.svelte';
  import TopBar from './TopBar.svelte';
  import BottomNav from './BottomNav.svelte';
  import { direction } from '../../stores/language.js';
  import { sidebarCollapsed, toggleSidebarCollapsed } from '../../stores/sidebar.js';

  const dispatch = createEventDispatcher();

  export let navItems = [];
  export let secondaryItems = [];
  export let activeNav = '';
  export let pageTitle = '';
  export let userName = '';
  export let userEmail = '';
  export let planLabel = '';
  export let bottomNavItems = [];

  function onSignOut() {
    dispatch('signOut');
  }

  function onNotifications() {
    dispatch('openNotifications');
  }

  function onProfile() {
    dispatch('openProfile');
  }

  function onToggleSidebar() {
    toggleSidebarCollapsed();
  }
</script>

<div
  class={`app-shell ${$direction === 'rtl' ? 'rtl' : 'ltr'} ${$sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
>
  <Sidebar
    items={navItems}
    secondaryItems={secondaryItems}
    activeId={activeNav}
    planLabel={planLabel}
    collapsed={$sidebarCollapsed}
  />

  <div class="shell-main">
    <TopBar
      pageTitle={pageTitle}
      userName={userName}
      userEmail={userEmail}
      planLabel={planLabel}
      sidebarCollapsed={$sidebarCollapsed}
      on:signOut={onSignOut}
      on:openNotifications={onNotifications}
      on:openProfile={onProfile}
      on:toggleSidebar={onToggleSidebar}
    />

    <main class="shell-content">
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
  </div>

  <BottomNav items={bottomNavItems.length ? bottomNavItems : navItems} activeId={activeNav} />
</div>

<style>
  .app-shell {
    --shell-sidebar-width-expanded: var(--size-sidebar, 16rem);
    --shell-sidebar-width-collapsed: var(--size-sidebar-collapsed, 5rem);
    --shell-sidebar-width: var(--shell-sidebar-width-expanded);
    min-height: 100dvh;
    background: var(--ui-bg-shell);
    color: var(--ui-text-primary);
    overflow: clip;
    isolation: isolate;
  }

  .app-shell.sidebar-collapsed {
    --shell-sidebar-width: var(--shell-sidebar-width-collapsed);
  }

  .app-shell.rtl {
    direction: rtl;
  }

  .shell-main {
    position: relative;
    height: 100dvh;
    width: calc(100% - var(--shell-sidebar-width));
    max-width: calc(100% - var(--shell-sidebar-width));
    min-height: 100dvh;
    min-width: 0;
    margin-inline-start: var(--shell-sidebar-width);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: clip;
    background: var(--ui-bg-page);
    transition: margin-inline-start var(--motion-default) var(--ease-standard),
      width var(--motion-default) var(--ease-standard),
      max-width var(--motion-default) var(--ease-standard);
  }

  .shell-main::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--ui-text-primary) 6%, transparent) 0%, transparent 32%),
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 28%, transparent) 0%, transparent 32%);
    opacity: 0.8;
  }

  .shell-content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable both-edges;
    position: relative;
    z-index: 0;
  }

  .content-wrapper {
    width: 100%;
    padding: var(--layout-shell-padding-block) var(--layout-shell-padding-inline)
      calc(var(--layout-shell-padding-block) + env(safe-area-inset-bottom));
    box-sizing: border-box;
    display: grid;
    align-content: start;
    gap: var(--layout-shell-page-gap);
    min-width: 0;
    min-height: 100%;
    position: relative;
    z-index: 1;
  }

  .content-wrapper > :global(*) {
    min-width: 0;
  }

  @media (max-width: 1024px) {
    .content-wrapper {
      padding-inline:
        max(var(--ui-space-4), env(safe-area-inset-left))
        max(var(--ui-space-4), env(safe-area-inset-right));
      gap: var(--layout-shell-page-gap-tight);
    }
  }

  @media (max-width: 767px) {
    .app-shell,
    .app-shell.rtl {
      display: block;
      overflow: visible;
    }

    .shell-main {
      height: auto;
      width: 100%;
      max-width: 100%;
      min-height: 100dvh;
      margin-inline-start: 0;
    }

    .content-wrapper {
      padding:
        var(--layout-shell-padding-block)
        max(var(--ui-space-4), env(safe-area-inset-left))
        calc(var(--layout-shell-padding-block) + 72px + env(safe-area-inset-bottom))
        max(var(--ui-space-4), env(safe-area-inset-right));
      gap: var(--layout-shell-page-gap-tight);
    }
  }
</style>
