<script>
  import PageLayout from '../lib/components/layout/PageLayout.svelte';
  import Badge from '../lib/components/ui/Badge.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import LanguageToggle from '../lib/components/ui/LanguageToggle.svelte';
  import MetaPill from '../lib/components/ui/MetaPill.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Section from '../lib/components/ui/Section.svelte';
  import SettingsPanelSkeleton from '../lib/components/ui/SettingsPanelSkeleton.svelte';
  import Tabs from '../lib/components/ui/Tabs.svelte';
  import ThemeToggle from '../lib/components/ui/ThemeToggle.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import { session, signOut } from '../stores/auth.js';
  import { theme } from '../stores/theme.js';
  import { t } from '../lib/i18n/t.js';

  let loggingOut = false;
  let activeTab = 'systems';

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

  $: settingsTabs = [
    { value: 'systems', label: t('settings.tabs.systems') },
    { value: 'account', label: t('settings.tabs.account') }
  ];
</script>

{#if !$session}
  <SettingsPanelSkeleton />
{:else}
  <PageLayout class="settings-page" width="wide" gap="spacious">
    <PageHeader
      className="settings-header"
      eyebrow={t('settings.eyebrow')}
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
    >
      <div slot="meta" class="hero-meta">
        <MetaPill label={t('settings.account.title')}>
          <StatusBadge status={plan === 'free' ? 'info' : 'ready'}>{planLabel}</StatusBadge>
        </MetaPill>
        <MetaPill label={t('settings.theme.title')}>
          <Badge tone="neutral" variant="outline" size="sm">{currentThemeLabel}</Badge>
        </MetaPill>
      </div>
    </PageHeader>

    <div class="settings-grid">
      <div class="settings-tabs-wrap">
        <Tabs
          className="settings-tabs"
          ariaLabel={t('settings.title')}
          items={settingsTabs}
          value={activeTab}
          fullWidth
          on:change={(event) => (activeTab = event.detail.value)}
        />
      </div>

      {#if activeTab === 'systems'}
        <Section
          id="language"
          className="settings-section settings-section-language"
          title={t('settings.language.title')}
          description={t('settings.language.description')}
        >
          <div slot="header" class="section-copy">
            <p class="section-eyebrow">{t('settings.tabs.systems')}</p>
            <h2>{t('settings.language.title')}</h2>
            <p>{t('settings.language.description')}</p>
          </div>

          <div class="settings-block">
            <LanguageToggle />
            <p class="helper">{t('settings.language.helper')}</p>
          </div>
        </Section>

        <Section
          className="settings-section settings-section-theme"
          title={t('settings.theme.title')}
          description={t('settings.theme.description')}
        >
          <div slot="header" class="section-copy">
            <p class="section-eyebrow">{t('settings.tabs.systems')}</p>
            <h2>{t('settings.theme.title')}</h2>
            <p>{t('settings.theme.description')}</p>
          </div>

          <div class="theme-row">
            <ThemeToggle value={$theme} on:change={handleThemeChange} />
            <div class="theme-summary">
              <p class="theme-current">{t('settings.theme.current', { theme: currentThemeLabel })}</p>
              <p class="helper">{t('settings.theme.helper')}</p>
            </div>
          </div>
        </Section>
      {:else}
        <Section
          id="plan"
          className="settings-section settings-section-account"
          title={t('settings.account.title')}
          description={t('settings.account.description')}
        >
          <div slot="header" class="section-copy">
            <p class="section-eyebrow">{t('settings.tabs.account')}</p>
            <h2>{t('settings.account.title')}</h2>
            <p>{t('settings.account.description')}</p>
          </div>

          <div slot="actions">
            <StatusBadge status={plan === 'free' ? 'info' : 'ready'}>{planLabel}</StatusBadge>
          </div>

          <article class="account-card">
            <div class="account-copy">
              <p class="account-label">{t('settings.account.title')}</p>
              <h3>{userName}</h3>
              <p>{userEmail}</p>
            </div>

            <div class="account-side">
              <div class="account-plan">
                <span>{t('settings.account.title')}</span>
                <Badge tone={plan === 'free' ? 'info' : 'success'} variant="soft" size="sm">{planLabel}</Badge>
              </div>

              <div class="actions">
                <Button type="button" variant="secondary" size="sm" disabled title={t('common.comingSoon')}>
                  {t('settings.account.actions.profile')}
                </Button>
                <Button type="button" variant="danger" size="sm" on:click={handleLogout} loading={loggingOut}>
                  {loggingOut ? t('settings.account.actions.loggingOut') : t('settings.account.actions.logout')}
                </Button>
              </div>
            </div>
          </article>
        </Section>
      {/if}
    </div>
  </PageLayout>
{/if}

<style>
  :global(.settings-page) {
    display: grid;
    gap: var(--study-flow-page-gap);
    min-width: 0;
  }

  .hero-meta {
    display: grid;
    gap: var(--ui-space-3);
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .settings-grid {
    display: grid;
    gap: var(--ui-space-4);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-width: 0;
  }

  .settings-tabs-wrap {
    grid-column: 1 / -1;
  }

  :global(.settings-tabs) {
    width: min(100%, 26rem);
  }

  :global(.settings-section) {
    min-width: 0;
  }

  :global(.settings-section p) {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .section-copy {
    display: grid;
    gap: var(--ui-space-1);
  }

  .section-eyebrow {
    margin: 0;
    color: var(--ui-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: var(--ui-type-label);
    font-weight: 600;
  }

  .section-copy h2 {
    margin: 0;
    font-size: var(--ui-type-title-sm);
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--ui-text-primary);
  }

  .settings-block {
    display: grid;
    gap: 0.75rem;
  }

  .theme-row {
    display: grid;
    gap: 1rem;
  }

  .theme-current {
    font-size: 0.72rem;
    color: var(--color-text-primary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .theme-summary {
    display: grid;
    gap: 0.45rem;
    padding: 1rem;
    border: 1px solid color-mix(in srgb, var(--foreground) 8%, var(--border) 92%);
    border-radius: 0.9rem;
    background: color-mix(in srgb, var(--muted) 72%, transparent);
  }

  .helper {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    line-height: 1.55;
  }

  .account-card {
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    border-radius: 1rem;
    padding: 1.25rem;
    background: color-mix(in srgb, var(--card) 72%, var(--muted) 28%);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    box-shadow: var(--shadow-inline-control);
  }

  .account-copy {
    display: grid;
    gap: 0.35rem;
  }

  .account-label {
    color: var(--muted-foreground);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .account-card h3 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: clamp(1.1rem, 2vw, 1.35rem);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .account-card p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .account-side {
    display: grid;
    gap: 0.9rem;
    min-width: min(100%, 260px);
  }

  .account-plan {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
    color: var(--muted-foreground);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
  }

  @media (max-width: 900px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    :global(.settings-tabs) {
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .hero-meta {
      grid-template-columns: 1fr;
    }

    .actions {
      width: 100%;
    }

    .actions :global(.ui-button) {
      width: 100%;
    }

    .account-side {
      min-width: 100%;
    }
  }
</style>
