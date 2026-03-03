<script>
  import { createEventDispatcher } from 'svelte';
  import Sidebar from './Sidebar.svelte';
  import TopBar from './TopBar.svelte';
  import BottomNav from './BottomNav.svelte';

  export let pageTitle = '';
  export let primaryNav = [];
  export let secondaryNav = [];
  export let mobileNav = [];
  export let activeId = '';
  export let plan = { label: '', badge: '', variant: 'free' };
  export let notificationCount = 0;
  export let user = { name: '', email: '', avatarUrl: '' };

  const dispatch = createEventDispatcher();

  const handleNavigate = (event) => {
    dispatch('navigate', event.detail);
  };

  const handleTopbar = (event) => {
    dispatch(event.type, event.detail);
  };
</script>

<div class="app-shell">
  <Sidebar
    items={primaryNav}
    secondaryItems={secondaryNav}
    activeId={activeId}
    plan={plan}
    on:navigate={handleNavigate}
  >
    <div slot="logo">
      <slot name="logo">AI Study Assistant</slot>
    </div>
  </Sidebar>

  <div class="app-shell__main">
    <TopBar
      pageTitle={pageTitle}
      user={user}
      notificationCount={notificationCount}
      on:notifications={handleTopbar}
      on:profile={handleTopbar}
      on:logout={handleTopbar}
    >
      <span slot="title">
        <slot name="pageTitle">{pageTitle}</slot>
      </span>
    </TopBar>

    <main class="app-shell__content">
      <slot />
    </main>
  </div>

  <BottomNav items={mobileNav.length ? mobileNav : primaryNav} activeId={activeId} on:navigate={handleNavigate} />
</div>

<style>
  .app-shell {
    background: var(--color-bg);
    min-height: 100vh;
    color: var(--color-text-primary);
  }

  .app-shell__main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-shell__content {
    flex: 1;
    padding: var(--space-5);
    padding-block-end: calc(var(--space-6) + 64px);
  }

  @media (max-width: 767px) {
    .app-shell__content {
      padding-inline: var(--space-3);
    }
  }

  @media (min-width: 768px) {
    .app-shell__main {
      margin-inline-start: var(--size-sidebar);
    }

    :global(html[dir='rtl']) .app-shell__main {
      margin-inline-start: 0;
      margin-inline-end: var(--size-sidebar);
    }

    .app-shell__content {
      padding-block-end: var(--space-6);
    }
  }

  :global(html[dir='rtl']) .app-shell {
    direction: rtl;
  }
</style>
