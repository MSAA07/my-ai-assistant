<script>
  import Button from '../../lib/components/ui/Button.svelte';
  import { LANDING_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../../routes.js';
  import { router } from '../../stores/router.js';
  import { t } from '../../lib/i18n/t.js';

  function navigateHome() {
    router.navigate(LANDING_PATH);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function navigateTo(path) {
    router.navigate(path);
  }
</script>

<header class="public-header">
  <div class="public-header__inner">
    <button type="button" class="brand" on:click={navigateHome} aria-label={t('publicHeader.brandHome')}>
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-title">{t('publicHeader.brandName')}</span>
    </button>

    <div class="public-header__actions" aria-label={t('publicHeader.navLabel')}>
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

  .brand-mark {
    width: 1.125rem;
    height: 1.125rem;
    flex: 0 0 auto;
    border: 1px solid color-mix(in srgb, var(--ui-text-primary) 82%, transparent);
    border-radius: 0.25rem;
    background:
      linear-gradient(135deg, transparent 49%, var(--ui-text-primary) 50% 58%, transparent 59%),
      var(--ui-bg-page);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-bg-page) 70%, transparent);
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

  @media (max-width: 520px) {
    .public-header__inner {
      width: min(100% - 24px, var(--size-content));
      min-height: 60px;
      gap: var(--ui-space-2);
    }

    .brand-title {
      font-size: 0.875rem;
    }

    .public-header__actions {
      gap: 0.25rem;
    }

    :global(.public-header .ui-button) {
      min-height: 2.25rem;
      padding-inline: 0.625rem;
      font-size: 0.8125rem;
    }
  }
</style>
