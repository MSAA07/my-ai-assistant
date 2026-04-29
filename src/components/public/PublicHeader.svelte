<script>
  import Button from '../../lib/components/ui/Button.svelte';
  import ThemeToggle from '../../lib/components/ui/ThemeToggle.svelte';
  import { LANDING_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../../routes.js';
  import { currentPath, routeParams, router } from '../../stores/router.js';
  import { theme } from '../../stores/theme.js';

  const sectionLinks = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'faq', label: 'FAQ' }
  ];

  $: activePath = $currentPath;
  $: activeSection = $routeParams.section ?? '';
  $: isLanding = activePath === LANDING_PATH;

  function navigateHome() {
    router.navigate(LANDING_PATH);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function navigateToSection(sectionId) {
    const target = `${LANDING_PATH}?section=${sectionId}`;
    if (activePath === LANDING_PATH) {
      router.replace(target);
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    router.navigate(target);
  }

  function navigateTo(path) {
    router.navigate(path);
  }

  function handleThemeChange(event) {
    theme.setTheme(event.detail.theme);
  }
</script>

<header class="public-header">
  <div class="public-header__inner">
    <button type="button" class="brand" on:click={navigateHome} aria-label="Study Maxing home">
      <span class="brand-copy">
        <span class="brand-title">Study Maxing</span>
        <span class="brand-subtitle">Fast document-to-study workflow</span>
      </span>
    </button>

    <nav class="public-nav" aria-label="Public">
      {#each sectionLinks as link}
        <button
          type="button"
          class:active={isLanding && activeSection === link.id}
          on:click={() => navigateToSection(link.id)}
        >
          {link.label}
        </button>
      {/each}
    </nav>

    <div class="public-header__actions">
      <div class="theme-toggle-wrap">
        <ThemeToggle value={$theme} on:change={handleThemeChange} />
      </div>

      {#if activePath === SIGN_IN_PATH}
        <Button variant="ghost" size="sm" type="button" on:click={navigateHome}>Back to landing</Button>
        <Button variant="primary" size="sm" type="button" on:click={() => navigateTo(SIGN_UP_PATH)}>Get started</Button>
      {:else if activePath === SIGN_UP_PATH}
        <Button variant="ghost" size="sm" type="button" on:click={navigateHome}>Back to landing</Button>
        <Button variant="secondary" size="sm" type="button" on:click={() => navigateTo(SIGN_IN_PATH)}>Sign in</Button>
      {:else if !isLanding}
        <Button variant="ghost" size="sm" type="button" on:click={navigateHome}>Back to landing</Button>
        <Button variant="secondary" size="sm" type="button" on:click={() => navigateTo(SIGN_IN_PATH)}>Sign in</Button>
      {:else}
        <Button variant="ghost" size="sm" type="button" on:click={() => navigateTo(SIGN_IN_PATH)}>Sign in</Button>
        <Button variant="primary" size="sm" type="button" on:click={() => navigateTo(SIGN_UP_PATH)}>Get started</Button>
      {/if}
    </div>
  </div>
</header>

<style>
  .public-header {
    position: sticky;
    top: 0;
    z-index: 40;
    border-bottom: 1px solid color-mix(in srgb, var(--ui-border-default) 92%, transparent);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-bg-page) 92%, transparent), color-mix(in srgb, var(--ui-bg-page) 82%, transparent)),
      color-mix(in srgb, var(--ui-bg-page) 78%, transparent);
    backdrop-filter: blur(16px);
  }

  .public-header__inner {
    width: min(var(--size-content), calc(100% - 32px));
    min-height: 76px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-4);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.85rem;
    border: 0;
    background: transparent;
    padding: 0;
    color: var(--ui-text-primary);
    cursor: pointer;
    text-align: left;
  }

  .brand-copy {
    display: grid;
    gap: 0.12rem;
  }

  .brand-title {
    color: var(--ui-text-primary);
    font-size: 0.96rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .brand-subtitle {
    color: var(--ui-text-secondary);
    font-size: 0.76rem;
    line-height: 1.3;
  }

  .public-nav {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }

  .public-nav button {
    min-height: 2.25rem;
    padding: 0 0.8rem;
    border: 1px solid transparent;
    border-radius: var(--ui-radius-pill);
    background: transparent;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .public-nav button:hover,
  .public-nav button.active {
    color: var(--ui-text-primary);
    background: color-mix(in srgb, var(--ui-surface-secondary) 64%, transparent);
    border-color: color-mix(in srgb, var(--ui-border-default) 88%, transparent);
  }

  .public-nav button:focus-visible,
  .brand:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .public-header__actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .theme-toggle-wrap {
    min-width: 76px;
  }

  @media (max-width: 1024px) {
    .public-header__inner {
      grid-template-columns: auto auto;
      grid-template-areas:
        "brand actions"
        "nav nav";
      padding: 0.9rem 0;
    }

    .brand {
      grid-area: brand;
    }

    .public-header__actions {
      grid-area: actions;
    }

    .public-nav {
      grid-area: nav;
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: 0.1rem;
    }
  }

  @media (max-width: 640px) {
    .public-header__inner {
      width: min(100% - 24px, var(--size-content));
      grid-template-columns: 1fr;
      grid-template-areas:
        "brand"
        "actions"
        "nav";
      gap: var(--space-3);
    }

    .public-header__actions {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
    }

    .theme-toggle-wrap {
      width: 100%;
      min-width: 0;
    }

    .public-nav {
      justify-content: flex-start;
    }
  }
</style>
