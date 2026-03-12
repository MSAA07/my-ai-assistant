<script>
  import LanguageToggle from '../lib/components/ui/LanguageToggle.svelte';
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

<div class="settings-page">
  <header class="page-header">
    <p class="eyebrow">{t('settings.eyebrow')}</p>
    <h1>{t('settings.title')}</h1>
    <p class="subtitle">{t('settings.subtitle')}</p>
  </header>

  <section class="settings-section" id="language">
    <div>
      <h2>{t('settings.language.title')}</h2>
      <p>
        {#if ENABLE_ARABIC_UI}
          {t('settings.language.description')}
        {:else}
          {t('settings.language.disabled')}
        {/if}
      </p>
    </div>
    {#if ENABLE_ARABIC_UI}
      <LanguageToggle />
    {/if}
  </section>

  <section class="settings-section">
    <div>
      <h2>{t('settings.theme.title')}</h2>
      <p>{t('settings.theme.description')}</p>
    </div>
    <ThemeToggle value={$theme} on:change={handleThemeChange} />
    <p class="theme-current">{t('settings.theme.current', { theme: currentThemeLabel })}</p>
    <p class="helper">{t('settings.theme.helper')}</p>
  </section>

  <section class="settings-section" id="plan">
    <div class="account-header">
      <div>
        <h2>{t('settings.account.title')}</h2>
        <p>{t('settings.account.description')}</p>
      </div>
      <StatusBadge status={plan === 'free' ? 'info' : 'ready'}>{planLabel}</StatusBadge>
    </div>

    <div class="account-card">
      <div>
        <h3>{userName}</h3>
        <p>{userEmail}</p>
      </div>

      <div class="actions">
        <button type="button" class="ghost" disabled title={t('common.comingSoon')}>
          {t('settings.account.actions.profile')}
        </button>
        <button type="button" class="danger" on:click={handleLogout} disabled={loggingOut}>
          {loggingOut ? t('settings.account.actions.loggingOut') : t('settings.account.actions.logout')}
        </button>
      </div>
    </div>
  </section>
</div>

<style>
  .settings-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .page-header {
    text-align: start;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    font-size: 0.75rem;
  }

  h1 {
    margin: 0.25rem 0;
    font-size: 2.25rem;
    color: var(--color-text-primary);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .settings-section {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-3);
    background: var(--color-surface-1);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  h2 {
    margin: 0;
    color: var(--color-text-primary);
  }

  .settings-section p {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .theme-current {
    font-size: 0.95rem;
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .helper {
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .account-header {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    align-items: center;
    flex-wrap: wrap;
  }

  .account-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: var(--space-4);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-3);
    background: var(--color-surface-2);
  }

  .account-card h3 {
    margin: 0 0 0.5rem;
    color: var(--color-text-primary);
  }

  .account-card p {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    align-items: center;
  }

  .actions button {
    min-height: 44px;
    padding: 0 1.5rem;
    border-radius: var(--radius-1);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .actions button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .ghost {
    border: 1px dashed var(--color-border);
    background: transparent;
    color: var(--color-text-secondary);
  }

  .danger {
    border: none;
    background: var(--color-danger);
    color: var(--color-bg);
  }

  @media (max-width: 640px) {
    .settings-section {
      padding: var(--space-4);
    }
  }
</style>
