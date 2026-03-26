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
    display: grid;
    grid-template-columns: var(--shell-sidebar-width) minmax(0, 1fr);
    min-height: 100dvh;
    background: var(--ui-bg-shell);
    color: var(--ui-text-primary);
    isolation: isolate;
    transition: grid-template-columns var(--motion-default) var(--ease-standard);
  }

  .app-shell.sidebar-collapsed {
    --shell-sidebar-width: var(--shell-sidebar-width-collapsed);
  }

  .app-shell.rtl {
    direction: rtl;
  }

  .shell-main {
    position: relative;
    min-height: 100dvh;
    min-width: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    background: var(--ui-bg-page);
  }

  .shell-main::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top right, color-mix(in srgb, var(--ui-text-primary) 4%, transparent) 0%, transparent 30%);
    opacity: 0.35;
  }

  .shell-content {
    min-width: 0;
    min-height: auto;
    overflow-x: hidden;
    overflow-y: visible;
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
    }

    .shell-main {
      min-height: 100dvh;
    }

    .content-wrapper {
      padding:
        var(--layout-shell-padding-block)
        max(var(--ui-space-4), env(safe-area-inset-left))
        calc(var(--layout-shell-padding-block) + var(--size-bottom-nav) + env(safe-area-inset-bottom))
        max(var(--ui-space-4), env(safe-area-inset-right));
      gap: var(--layout-shell-page-gap-tight);
    }
  }
</style>
