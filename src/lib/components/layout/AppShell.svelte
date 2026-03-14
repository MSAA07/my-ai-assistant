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
    min-height: 100vh;
    background: var(--background);
    color: var(--foreground);
    overflow: hidden;
  }

  .app-shell.sidebar-collapsed {
    --shell-sidebar-width: var(--shell-sidebar-width-collapsed);
  }

  .app-shell.rtl {
    direction: rtl;
  }

  .shell-main {
    height: 100vh;
    width: calc(100% - var(--shell-sidebar-width));
    max-width: calc(100% - var(--shell-sidebar-width));
    min-height: 100vh;
    min-width: 0;
    margin-inline-start: var(--shell-sidebar-width);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--background);
    transition: margin-inline-start var(--motion-default) var(--ease-standard),
      width var(--motion-default) var(--ease-standard),
      max-width var(--motion-default) var(--ease-standard);
  }

  .shell-content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .content-wrapper {
    width: 100%;
    max-width: min(100%, var(--size-content-wide));
    margin: 0 auto;
    padding: 1.75rem 1.5rem;
    box-sizing: border-box;
    display: grid;
    gap: 1.5rem;
    min-width: 0;
  }

  .content-wrapper > :global(*) {
    min-width: 0;
  }

  @media (max-width: 1024px) {
    .content-wrapper {
      padding: 1.5rem 1.25rem;
      gap: 1.25rem;
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
      min-height: 100vh;
      margin-inline-start: 0;
    }

    .content-wrapper {
      padding: 1rem 1rem calc(1rem + 72px);
      gap: 1rem;
    }
  }
</style>
