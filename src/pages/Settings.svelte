<script>
  import LanguageToggle from '../lib/components/ui/LanguageToggle.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Section from '../lib/components/ui/Section.svelte';
  import SettingsPanelSkeleton from '../lib/components/ui/SettingsPanelSkeleton.svelte';
  import ThemeToggle from '../lib/components/ui/ThemeToggle.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import { ENABLE_ARABIC_UI } from '../lib/config/features.js';
  import { session, signOut } from '../stores/auth.js';
  import { theme } from '../stores/theme.js';
  import { t } from '../lib/i18n/t.js';

  let loggingOut = false;

  $: userName = $session?.user?.name ?? t('settings.account.anonymous');
  $: userEmail = $session?.user?.email ?? t('settings.account.noEmail');
  $: plan = $session?.user?.plan ?? 'free';
  $: planLabel = plan === 'pro' || plan === 'premium' ? t('nav.proBadge') : t('nav.freeBadge');
  $: currentThemeLabel = $theme === 'light' ? t('settings.theme.light') : t('settings.theme.dark');

  async function handleLogout() {
    loggingOut = true;
    try {
      await signOut();
      window.location.hash = '/';
    } finally {
      loggingOut = false;
    }
  }

  function handleThemeChange(event) {
    theme.setTheme(event.detail.theme);
  }
</script>

{#if !$session}
  <SettingsPanelSkeleton />
{:else}
  <div class="settings-page">
    <header class="page-header">
      <p class="eyebrow">{t('settings.eyebrow')}</p>
      <h1>{t('settings.title')}</h1>
      <p class="subtitle">{t('settings.subtitle')}</p>
    </header>

    <Section
      id="language"
      className="settings-section"
      title={t('settings.language.title')}
      description={ENABLE_ARABIC_UI ? t('settings.language.description') : t('settings.language.disabled')}
    >
      {#if ENABLE_ARABIC_UI}
        <LanguageToggle />
      {/if}
    </Section>

    <Section
      className="settings-section"
      title={t('settings.theme.title')}
      description={t('settings.theme.description')}
    >
      <div class="theme-row">
        <ThemeToggle value={$theme} on:change={handleThemeChange} />
        <p class="theme-current">{t('settings.theme.current', { theme: currentThemeLabel })}</p>
      </div>
      <p class="helper">{t('settings.theme.helper')}</p>
    </Section>

    <Section
      id="plan"
      className="settings-section"
      title={t('settings.account.title')}
      description={t('settings.account.description')}
    >
      <div slot="actions">
        <StatusBadge status={plan === 'free' ? 'info' : 'ready'}>{planLabel}</StatusBadge>
      </div>

      <article class="account-card">
        <div>
          <h3>{userName}</h3>
          <p>{userEmail}</p>
        </div>

        <div class="actions">
          <Button type="button" variant="secondary" size="sm" disabled title={t('common.comingSoon')}>
            {t('settings.account.actions.profile')}
          </Button>
          <Button type="button" variant="danger" size="sm" on:click={handleLogout} loading={loggingOut}>
            {loggingOut ? t('settings.account.actions.loggingOut') : t('settings.account.actions.logout')}
          </Button>
        </div>
      </article>
    </Section>
  </div>
{/if}

<style>
  .settings-page {
    display: grid;
    gap: var(--space-4);
  }

  .page-header {
    display: grid;
    gap: var(--space-1);
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    font-size: 0.75rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.12rem, 2.4vw, 1.35rem);
    font-weight: 600;
    letter-spacing: 0.01em;
    color: var(--color-text-primary);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    max-width: 72ch;
  }

  :global(.settings-section) {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  :global(.settings-section p) {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .theme-row {
    display: grid;
    gap: var(--space-2);
  }

  .theme-current {
    font-size: var(--font-size-xs);
    color: var(--color-text-primary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .helper {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .account-card {
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    padding: var(--space-3);
    background: var(--ui-surface-raised);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .account-card h3 {
    margin: 0 0 0.2rem;
    color: var(--color-text-primary);
    font-size: var(--font-size-md);
    font-weight: 600;
  }

  .account-card p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    align-items: center;
  }

  @media (max-width: 640px) {
    .actions {
      width: 100%;
    }

    .actions :global(.ui-button) {
      width: 100%;
    }
  }
</style>
