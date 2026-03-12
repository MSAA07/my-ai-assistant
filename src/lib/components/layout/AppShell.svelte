<script>
  import { createEventDispatcher } from 'svelte';
  import Sidebar from './Sidebar.svelte';
  import TopBar from './TopBar.svelte';
  import BottomNav from './BottomNav.svelte';
  import { direction } from '../../stores/language.js';

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
</script>

<div class={`app-shell ${$direction === 'rtl' ? 'rtl' : 'ltr'}`}>
  <Sidebar
    items={navItems}
    secondaryItems={secondaryItems}
    activeId={activeNav}
  />

  <div class="shell-main">
    <TopBar
      pageTitle={pageTitle}
      userName={userName}
      userEmail={userEmail}
      planLabel={planLabel}
      on:signOut={onSignOut}
      on:openNotifications={onNotifications}
      on:openProfile={onProfile}
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
    min-height: 100vh;
    display: grid;
    grid-template-columns: var(--size-sidebar) 1fr;
    background: var(--color-bg);
    color: var(--color-text-primary);
  }

  .app-shell.rtl {
    direction: rtl;
    grid-template-columns: 1fr var(--size-sidebar);
  }

  .shell-main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--gradient-bg-radial), var(--color-bg);
    min-width: 0;
  }

  .shell-content {
    flex: 1;
    display: flex;
    justify-content: center;
    width: 100%;
    min-width: 0;
  }

  .content-wrapper {
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
    padding: var(--space-4);
    box-sizing: border-box;
    display: grid;
    gap: var(--space-4);
    min-width: 0;
  }

  @media (max-width: 1024px) {
    .content-wrapper {
      padding: var(--space-4);
    }
  }

  @media (max-width: 768px) {
    .app-shell,
    .app-shell.rtl {
      grid-template-columns: 1fr;
    }

    .content-wrapper {
      padding: var(--space-3) var(--space-3) calc(var(--space-4) + 72px);
      gap: var(--space-3);
    }
  }
</style>
