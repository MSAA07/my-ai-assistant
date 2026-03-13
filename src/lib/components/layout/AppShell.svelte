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
    planLabel={planLabel}
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
    --shell-sidebar-width: 16rem;
    min-height: 100vh;
    display: flex;
    background: var(--background);
    color: var(--foreground);
    overflow: hidden;
  }

  .app-shell.rtl {
    direction: rtl;
    flex-direction: row-reverse;
  }

  .shell-main {
    flex: 1;
    min-height: 100vh;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--background);
  }

  .shell-content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
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
    }

    .content-wrapper {
      padding: 1rem 1rem calc(1rem + 72px);
      gap: 1rem;
    }
  }
</style>
