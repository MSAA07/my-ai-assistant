<script>
  import { direction } from '../../stores/language.js';
  import LanguageToggle from '../ui/LanguageToggle.svelte';
  import { t } from '../../i18n/t.js';

  export let items = [];
  export let secondaryItems = [];
  export let activeId = '';
</script>

<aside class={`sidebar ${$direction === 'rtl' ? 'rtl' : 'ltr'}`}>
  <div class="sidebar-top">
    <div class="brand">
      <span class="brand-mark">{t('app.shortName')}</span>
      <span class="brand-wordmark">{t('app.wordmark')}</span>
    </div>

    <nav class="nav">
      {#each items as item}
        <a
          class={`nav-item ${activeId === item.id ? 'active' : ''}`}
          href={item.href}
          aria-current={activeId === item.id ? 'page' : undefined}
        >
          <span class="nav-icon">
            {#if item.icon === 'dashboard'}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.75A1.75 1.75 0 0 1 5.25 11h5.5A1.75 1.75 0 0 1 12.5 12.75v6.5A1.75 1.75 0 0 1 10.75 21h-5.5A1.75 1.75 0 0 1 3.5 19.25v-6.5Zm9-8A1.75 1.75 0 0 1 14.25 3h4.5A1.75 1.75 0 0 1 20.5 4.75v4.5A1.75 1.75 0 0 1 18.75 11h-4.5A1.75 1.75 0 0 1 12.5 9.25v-4.5ZM3.5 4.75A1.75 1.75 0 0 1 5.25 3h5.5A1.75 1.75 0 0 1 12.5 4.75v2A1.75 1.75 0 0 1 10.75 8.5h-5.5A1.75 1.75 0 0 1 3.5 6.75v-2ZM13.5 13.75a1.75 1.75 0 0 1 1.75-1.75h3.5A1.75 1.75 0 0 1 20.5 13.75v5.5A1.75 1.75 0 0 1 18.75 21h-3.5A1.75 1.75 0 0 1 13.5 19.25v-5.5Z" /></svg>
            {:else if item.icon === 'documents'}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2.75A2.75 2.75 0 0 0 4.25 5.5v13A2.75 2.75 0 0 0 7 21.25h10A2.75 2.75 0 0 0 19.75 18.5V9.81a2.75 2.75 0 0 0-.81-1.94l-4.06-4.06A2.75 2.75 0 0 0 12.94 3H7Zm9.5 6.75H13a1 1 0 0 1-1-1V4.5" /></svg>
            {:else if item.icon === 'exams'}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 4.25A2.25 2.25 0 0 1 7.75 2h8.5A2.25 2.25 0 0 1 18.5 4.25v15.5a.25.25 0 0 1-.38.21L12 16.65l-6.12 3.31a.25.25 0 0 1-.38-.21V4.25Z" /></svg>
            {:else if item.icon === 'flashcards'}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.75 5.5A2.75 2.75 0 0 1 7.5 2.75h11A2.75 2.75 0 0 1 21.25 5.5v9a2.75 2.75 0 0 1-2.75 2.75h-11A2.75 2.75 0 0 1 4.5 14.5v-9Zm-2 4.75A2.25 2.25 0 0 1 5 8H6v6.5a4.25 4.25 0 0 0 4.25 4.25h8.5a2.25 2.25 0 0 1-2.25 2.25h-11A2.25 2.25 0 0 1 3 18.75v-8.5Z" /></svg>
            {:else if item.icon === 'settings'}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.25A3.75 3.75 0 1 1 8.25 12 3.75 3.75 0 0 1 12 8.25Zm8.5 3a1 1 0 0 1 .95.68 8.41 8.41 0 0 1 0 6.14 1 1 0 0 1-.95.68h-1.11a1 1 0 0 0-.94.67l-.25.77a1 1 0 0 1-1.52.52l-.95-.69a1 1 0 0 0-1.05-.05L13.5 21a1 1 0 0 1-1 0l-.94-.53a1 1 0 0 0-1.05.05l-.95.69a1 1 0 0 1-1.52-.52l-.25-.77a1 1 0 0 0-.94-.67H5.64a1 1 0 0 1-.95-.68 8.41 8.41 0 0 1 0-6.14 1 1 0 0 1 .95-.68h1.11a1 1 0 0 0 .94-.67l.25-.77a1 1 0 0 1 1.52-.52l.95.69a1 1 0 0 0 1.05.05l.94-.53a1 1 0 0 1 1 0l.94.53a1 1 0 0 0 1.05-.05l.95-.69a1 1 0 0 1 1.52.52l.25.77a1 1 0 0 0 .94.67Z" /></svg>
            {:else if item.icon === 'plan'}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.75A2.75 2.75 0 0 1 7.75 3h8.5A2.75 2.75 0 0 1 19 5.75v12.5A2.75 2.75 0 0 1 16.25 21h-8.5A2.75 2.75 0 0 1 5 18.25V5.75ZM8.5 7a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5Zm0 4a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5Zm0 4a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5Z" /></svg>
            {:else if item.icon === 'admin'}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3.25 3.25 0 0 1 2.79 1.58l.38.63 2.37.46a3.25 3.25 0 0 1 2.6 3.53l-.09.73.57.9a3.25 3.25 0 0 1-.55 4.08l-.58.59.1.82a3.25 3.25 0 0 1-2.62 3.53l-2.37.46-.38.63a3.25 3.25 0 0 1-5.58 0l-.38-.63-2.37-.46a3.25 3.25 0 0 1-2.6-3.53l.09-.73-.57-.9a3.25 3.25 0 0 1 .55-4.08l.58-.59-.1-.82a3.25 3.25 0 0 1 2.62-3.53l2.37-.46.38-.63A3.25 3.25 0 0 1 12 2Zm0 6a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z" /></svg>
            {/if}
          </span>
          <span class="nav-label">{item.label}</span>
          {#if item.badge}
            <span class={`nav-badge ${item.badge.variant ?? ''}`}>{item.badge.label}</span>
          {/if}
        </a>
      {/each}
    </nav>
  </div>

  <div class="sidebar-bottom">
    <div class="sidebar-divider" aria-hidden="true"></div>
    {#each secondaryItems as item}
      <a class="nav-item secondary" href={item.href}>
        <span class="nav-icon">
          {#if item.icon === 'settings'}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.25A3.75 3.75 0 1 1 8.25 12 3.75 3.75 0 0 1 12 8.25Zm8.5 3a1 1 0 0 1 .95.68 8.41 8.41 0 0 1 0 6.14 1 1 0 0 1-.95.68h-1.11a1 1 0 0 0-.94.67l-.25.77a1 1 0 0 1-1.52.52l-.95-.69a1 1 0 0 0-1.05-.05L13.5 21a1 1 0 0 1-1 0l-.94-.53a1 1 0 0 0-1.05.05l-.95.69a1 1 0 0 1-1.52-.52l-.25-.77a1 1 0 0 0-.94-.67H5.64a1 1 0 0 1-.95-.68 8.41 8.41 0 0 1 0-6.14 1 1 0 0 1 .95-.68h1.11a1 1 0 0 0 .94-.67l.25-.77a1 1 0 0 1 1.52-.52l.95.69a1 1 0 0 0 1.05.05l.94-.53a1 1 0 0 1 1 0l.94.53a1 1 0 0 0 1.05-.05l.95-.69a1 1 0 0 1 1.52.52l.25.77a1 1 0 0 0 .94.67Z" /></svg>
          {:else if item.icon === 'plan'}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.75A2.75 2.75 0 0 1 7.75 3h8.5A2.75 2.75 0 0 1 19 5.75v12.5A2.75 2.75 0 0 1 16.25 21h-8.5A2.75 2.75 0 0 1 5 18.25V5.75Zm3.5 3.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5Zm0 4a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5Z" /></svg>
          {/if}
        </span>
        <span class="nav-label">{item.label}</span>
        {#if item.badge}
          <span class={`nav-badge ${item.badge.variant ?? ''}`}>{item.badge.label}</span>
        {/if}
      </a>
    {/each}

    <div class="language-card">
      <div>
        <p class="language-title">{t('language.sidebarLabel')}</p>
        <p class="language-description">{t('language.sidebarDescription')}</p>
      </div>
      <LanguageToggle />
    </div>
  </div>
</aside>

<style>
  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    width: var(--size-sidebar);
    background: var(--color-sidebar);
    border-inline-end: 1px solid var(--color-border);
    padding: var(--space-5) var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .sidebar.rtl {
    border-inline-end: none;
    border-inline-start: 1px solid var(--color-border);
  }

  .sidebar-top {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    flex: 1;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-primary);
  }

  .brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-accent-surface);
    color: var(--color-accent-primary);
    font-size: 0.95rem;
  }

  .nav {
    display: grid;
    gap: var(--space-1);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0.75rem 0.875rem;
    border-radius: var(--radius-2);
    color: var(--color-text-secondary);
    text-decoration: none;
    min-height: 48px;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .nav-item:hover {
    background: var(--color-surface-2);
    color: var(--color-text-primary);
  }

  .nav-item.active {
    background: var(--color-accent-surface);
    color: var(--color-text-primary);
    box-shadow: inset 0 0 0 1px var(--color-accent-primary);
  }

  .nav-icon {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-surface-2);
    color: inherit;
  }

  .nav-icon svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .nav-label {
    flex: 1;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .nav-badge {
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .nav-badge.success {
    background: var(--color-success-surface);
    color: var(--color-success);
  }

  .secondary {
    color: var(--color-text-muted);
  }

  .sidebar-bottom {
    margin-top: auto;
    display: grid;
    gap: var(--space-3);
  }

  .sidebar-divider {
    height: 1px;
    background: var(--color-border);
    opacity: 0.35;
    margin-bottom: var(--space-2);
  }

  .language-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background: var(--color-surface-2);
  }

  .language-title {
    margin: 0;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .language-description {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .language-card :global(.language-toggle) {
    width: 100%;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }
  }
</style>
