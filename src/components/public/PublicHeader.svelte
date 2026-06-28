<script>
  import { onDestroy, onMount } from 'svelte';
  import { SlidersHorizontal } from '@lucide/svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import LanguageToggle from '../../lib/components/ui/LanguageToggle.svelte';
  import MenuSurface from '../../lib/components/ui/MenuSurface.svelte';
  import ThemeToggle from '../../lib/components/ui/ThemeToggle.svelte';
  import { availableLanguages } from '../../lib/stores/language.js';
  import { LANDING_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../../routes.js';
  import { router } from '../../stores/router.js';
  import { theme } from '../../stores/theme.js';
  import { t } from '../../lib/i18n/t.js';

  let preferencesOpen = false;
  let preferencesWrapper;

  function navigateHome() {
    router.navigate(LANDING_PATH);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function navigateTo(path) {
    router.navigate(path);
  }

  function togglePreferences(event) {
    event?.stopPropagation();
    preferencesOpen = !preferencesOpen;
  }

  function closePreferences() {
    preferencesOpen = false;
  }

  function handleOutsideClick(event) {
    if (!preferencesOpen) return;
    if (preferencesWrapper && !preferencesWrapper.contains(event.target)) {
      closePreferences();
    }
  }

  function handleWindowKeydown(event) {
    if (event.key === 'Escape') {
      closePreferences();
    }
  }

  function handleThemeChange(event) {
    theme.setTheme(event.detail.theme);
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleOutsideClick);
      window.addEventListener('keydown', handleWindowKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleWindowKeydown);
    }
  });
</script>

<header class="public-header">
  <div class="public-header__inner">
    <button type="button" class="brand" on:click={navigateHome} aria-label={t('publicHeader.brandHome')}>
      <span class="brand-title">{t('publicHeader.brandName')}</span>
    </button>

    <div class="public-header__actions" aria-label={t('publicHeader.navLabel')}>
      <div class="preferences" bind:this={preferencesWrapper}>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          className="preferences-trigger"
          on:click={togglePreferences}
          aria-haspopup="dialog"
          aria-expanded={preferencesOpen}
          aria-controls="public-preferences-menu"
          aria-label={t('publicHeader.preferencesLabel')}
          title={t('publicHeader.preferencesLabel')}
        >
          <SlidersHorizontal slot="icon" aria-hidden="true" />
        </Button>

        {#if preferencesOpen}
          <MenuSurface
            id="public-preferences-menu"
            className="preferences-menu"
            role="dialog"
            minWidth="260px"
            aria-label={t('publicHeader.preferencesMenuLabel')}
          >
            <div class="preferences-menu__header">
              {t('publicHeader.preferences')}
            </div>

            <div class="preferences-menu__row">
              <span class="preferences-menu__label">{t('settings.theme.title')}</span>
              <ThemeToggle value={$theme} on:change={handleThemeChange} />
            </div>

            {#if availableLanguages.length > 1}
              <div class="preferences-menu__row">
                <span class="preferences-menu__label">{t('settings.language.title')}</span>
                <LanguageToggle />
              </div>
            {/if}
          </MenuSurface>
        {/if}
      </div>

      <Button variant="ghost" size="sm" type="button" on:click={() => navigateTo(SIGN_IN_PATH)}>
        {t('publicHeader.actions.signIn')}
      </Button>
      <Button variant="primary" size="sm" type="button" on:click={() => navigateTo(SIGN_UP_PATH)}>
        {t('publicHeader.actions.getStarted')}
      </Button>
    </div>
  </div>
</header>

<style>
  .public-header {
    position: sticky;
    top: 0;
    z-index: 40;
    border-bottom: 1px solid color-mix(in srgb, var(--ui-border-default) 72%, transparent);
    background: color-mix(in srgb, var(--ui-bg-page) 76%, transparent);
    backdrop-filter: saturate(180%) blur(18px);
    -webkit-backdrop-filter: saturate(180%) blur(18px);
  }

  .public-header__inner {
    width: min(var(--size-content), calc(100% - 32px));
    min-height: 64px;
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-4);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 0;
    border: 0;
    background: transparent;
    padding: 0;
    color: var(--ui-text-primary);
    cursor: pointer;
    font: inherit;
    text-align: start;
  }

  .brand-title {
    min-width: 0;
    color: var(--ui-text-primary);
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 1;
    white-space: nowrap;
  }

  .brand:focus-visible {
    border-radius: var(--ui-radius-sm);
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .public-header__actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex: 0 0 auto;
  }

  .preferences {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }

  :global(.preferences-trigger.ui-button) {
    color: var(--ui-text-secondary);
  }

  :global(.preferences-trigger.ui-button:hover),
  :global(.preferences-trigger.ui-button[aria-expanded='true']) {
    color: var(--ui-text-primary);
    background: color-mix(in srgb, var(--ui-text-primary) 7%, transparent);
  }

  :global(.preferences-menu) {
    position: absolute;
    inset-inline-end: 0;
    top: calc(100% + 0.55rem);
    z-index: 60;
    gap: 0.45rem;
    padding: 0.5rem;
  }

  .preferences-menu__header {
    padding: 0.35rem 0.45rem 0.15rem;
    color: var(--ui-text-primary);
    font-size: var(--font-size-xs);
    font-weight: 700;
    letter-spacing: 0;
  }

  .preferences-menu__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    min-height: 3rem;
    padding: 0.45rem;
    border: 1px solid color-mix(in srgb, var(--ui-border-subtle) 72%, transparent);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--ui-surface-secondary) 46%, transparent);
  }

  .preferences-menu__label {
    min-width: 0;
    color: var(--ui-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: 600;
    line-height: 1.2;
  }

  @media (max-width: 520px) {
    .public-header__inner {
      width: min(100% - 16px, var(--size-content));
      min-height: 60px;
      gap: var(--ui-space-2);
    }

    .brand {
      min-width: 2.5rem;
      min-height: 2.5rem;
    }

    .brand-title {
      font-size: 0.8125rem;
    }

    .public-header__actions {
      gap: 0.25rem;
    }

    :global(.public-header .ui-button) {
      min-height: 2.5rem;
      padding-inline: 0.45rem;
      font-size: 0.78rem;
    }

    :global(.public-header .preferences-trigger.ui-button) {
      min-width: 2.5rem;
      min-height: 2.5rem;
      padding-inline: 0;
    }
  }

  @media (max-width: 420px) {
    .brand-title {
      display: inline;
      font-size: 0.8125rem;
    }

    :global(.preferences-menu) {
      position: fixed;
      inset-inline: 8px;
      top: 68px;
      min-width: 0;
    }
  }

  @media (max-width: 360px) {
    .public-header__inner {
      gap: 0.375rem;
    }

    .public-header__actions {
      gap: 0.125rem;
    }

    :global(.public-header .ui-button) {
      padding-inline: 0.375rem;
      font-size: 0.75rem;
    }
  }
</style>
