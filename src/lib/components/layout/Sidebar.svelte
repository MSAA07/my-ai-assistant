<script>
  import { direction } from '../../stores/language.js';
  import LanguageToggle from '../ui/LanguageToggle.svelte';
  import Badge from '../ui/Badge.svelte';
  import { t } from '../../i18n/t.js';
  import { ENABLE_ARABIC_UI } from '../../config/features.js';

  export let items = [];
  export let secondaryItems = [];
  export let activeId = '';
  export let planLabel = '';
  export let collapsed = false;

  const badgeToneMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'danger',
    accent: 'accent',
  };

  $: planItem = secondaryItems.find((item) => item.icon === 'plan') ?? secondaryItems[0] ?? null;
  $: footerItems = secondaryItems.filter((item) => item !== planItem);
</script>

<aside
  class={`sidebar ${$direction === 'rtl' ? 'rtl' : 'ltr'} ${collapsed ? 'collapsed' : ''}`}
  aria-label={t('nav.mobileLabel')}
>
  <div class="sidebar-header">
    <a class="brand" href="#/home" aria-label={t('app.wordmark')}>
      <span class="brand-mark">{t('app.shortName').slice(0, 1)}</span>
      <span class="brand-wordmark">{t('app.wordmark')}</span>
    </a>
  </div>

  <nav class="sidebar-nav">
    {#each items as item}
      <a
        class={`nav-item ${activeId === item.id ? 'active' : ''}`}
        href={item.href}
        aria-current={activeId === item.id ? 'page' : undefined}
        aria-label={collapsed ? item.label : undefined}
        title={collapsed ? item.label : undefined}
      >
        <span class="nav-icon" aria-hidden="true">
          {#if item.icon === 'dashboard'}
            <svg viewBox="0 0 24 24"><path d="M3.5 12.75A1.75 1.75 0 0 1 5.25 11h5.5A1.75 1.75 0 0 1 12.5 12.75v6.5A1.75 1.75 0 0 1 10.75 21h-5.5A1.75 1.75 0 0 1 3.5 19.25v-6.5Zm9-8A1.75 1.75 0 0 1 14.25 3h4.5A1.75 1.75 0 0 1 20.5 4.75v4.5A1.75 1.75 0 0 1 18.75 11h-4.5A1.75 1.75 0 0 1 12.5 9.25v-4.5ZM3.5 4.75A1.75 1.75 0 0 1 5.25 3h5.5A1.75 1.75 0 0 1 12.5 4.75v2A1.75 1.75 0 0 1 10.75 8.5h-5.5A1.75 1.75 0 0 1 3.5 6.75v-2ZM13.5 13.75a1.75 1.75 0 0 1 1.75-1.75h3.5A1.75 1.75 0 0 1 20.5 13.75v5.5A1.75 1.75 0 0 1 18.75 21h-3.5A1.75 1.75 0 0 1 13.5 19.25v-5.5Z" /></svg>
          {:else if item.icon === 'documents'}
            <svg viewBox="0 0 24 24"><path d="M7 2.75A2.75 2.75 0 0 0 4.25 5.5v13A2.75 2.75 0 0 0 7 21.25h10A2.75 2.75 0 0 0 19.75 18.5V9.81a2.75 2.75 0 0 0-.81-1.94l-4.06-4.06A2.75 2.75 0 0 0 12.94 3H7Zm9.5 6.75H13a1 1 0 0 1-1-1V4.5" /></svg>
          {:else if item.icon === 'exams'}
            <svg viewBox="0 0 24 24"><path d="M5.5 4.25A2.25 2.25 0 0 1 7.75 2h8.5A2.25 2.25 0 0 1 18.5 4.25v15.5a.25.25 0 0 1-.38.21L12 16.65l-6.12 3.31a.25.25 0 0 1-.38-.21V4.25Z" /></svg>
          {:else if item.icon === 'flashcards'}
            <svg viewBox="0 0 24 24"><path d="M4.75 5.5A2.75 2.75 0 0 1 7.5 2.75h11A2.75 2.75 0 0 1 21.25 5.5v9a2.75 2.75 0 0 1-2.75 2.75h-11A2.75 2.75 0 0 1 4.5 14.5v-9Zm-2 4.75A2.25 2.25 0 0 1 5 8H6v6.5a4.25 4.25 0 0 0 4.25 4.25h8.5a2.25 2.25 0 0 1-2.25 2.25h-11A2.25 2.25 0 0 1 3 18.75v-8.5Z" /></svg>
          {:else if item.icon === 'settings'}
            <svg viewBox="0 0 24 24"><path d="M12 8.25A3.75 3.75 0 1 1 8.25 12 3.75 3.75 0 0 1 12 8.25Zm8.5 3a1 1 0 0 1 .95.68 8.41 8.41 0 0 1 0 6.14 1 1 0 0 1-.95.68h-1.11a1 1 0 0 0-.94.67l-.25.77a1 1 0 0 1-1.52.52l-.95-.69a1 1 0 0 0-1.05-.05L13.5 21a1 1 0 0 1-1 0l-.94-.53a1 1 0 0 0-1.05.05l-.95.69a1 1 0 0 1-1.52-.52l-.25-.77a1 1 0 0 0-.94-.67H5.64a1 1 0 0 1-.95-.68 8.41 8.41 0 0 1 0-6.14 1 1 0 0 1 .95-.68h1.11a1 1 0 0 0 .94-.67l.25-.77a1 1 0 0 1 1.52-.52l.95.69a1 1 0 0 0 1.05.05l.94-.53a1 1 0 0 1 1 0l.94.53a1 1 0 0 0 1.05-.05l.95-.69a1 1 0 0 1 1.52.52l.25.77a1 1 0 0 0 .94.67Z" /></svg>
          {:else if item.icon === 'plan'}
            <svg viewBox="0 0 24 24"><path d="M5 5.75A2.75 2.75 0 0 1 7.75 3h8.5A2.75 2.75 0 0 1 19 5.75v12.5A2.75 2.75 0 0 1 16.25 21h-8.5A2.75 2.75 0 0 1 5 18.25V5.75Zm3.5 3.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5Zm0 4a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5Z" /></svg>
          {:else if item.icon === 'admin'}
            <svg viewBox="0 0 24 24"><path d="M12 2a3.25 3.25 0 0 1 2.79 1.58l.38.63 2.37.46a3.25 3.25 0 0 1 2.6 3.53l-.09.73.57.9a3.25 3.25 0 0 1-.55 4.08l-.58.59.1.82a3.25 3.25 0 0 1-2.62 3.53l-2.37.46-.38.63a3.25 3.25 0 0 1-5.58 0l-.38-.63-2.37-.46a3.25 3.25 0 0 1-2.6-3.53l.09-.73-.57-.9a3.25 3.25 0 0 1 .55-4.08l.58-.59-.1-.82a3.25 3.25 0 0 1 2.62-3.53l2.37-.46.38-.63A3.25 3.25 0 0 1 12 2Zm0 6a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z" /></svg>
          {/if}
        </span>

        <span class="nav-label">{item.label}</span>

        {#if item.badge}
          <Badge className="nav-badge" size="xs" tone={badgeToneMap[item.badge.variant] ?? 'neutral'}>
            {item.badge.label}
          </Badge>
        {/if}
      </a>
    {/each}
  </nav>

  <div class="sidebar-footer">
    {#if footerItems.length > 0}
      <div class="footer-links">
        {#each footerItems as item}
          <a class="nav-item footer-link" href={item.href}>
            <span class="nav-label">{item.label}</span>
          </a>
        {/each}
      </div>
    {/if}

    {#if planItem}
      <a class="plan-card" href={planItem.href}>
        <p class="plan-label">{planItem.label}</p>
        <p class="plan-value">{planItem.badge?.label || planLabel || t('nav.freeBadge')}</p>
      </a>
    {/if}

    {#if ENABLE_ARABIC_UI}
      <div class="language-card">
        <div>
          <p class="language-title">{t('language.sidebarLabel')}</p>
          <p class="language-description">{t('language.sidebarDescription')}</p>
        </div>
        <LanguageToggle />
      </div>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    inset-block: 0;
    inset-inline-start: 0;
    z-index: 20;
    box-sizing: border-box;
    display: flex;
    height: 100vh;
    width: var(--shell-sidebar-width, 16rem);
    flex-direction: column;
    overflow: hidden auto;
    background: var(--sidebar, var(--card));
    border-inline-end: 1px solid var(--border);
    box-shadow: inset -1px 0 0 color-mix(in srgb, var(--foreground) 4%, transparent);
    transition: width var(--motion-default) var(--ease-standard);
  }

  .sidebar.rtl {
    border-inline-end: none;
    border-inline-start: 1px solid var(--border);
  }

  .sidebar-header {
    display: flex;
    min-height: 56px;
    align-items: center;
    padding: 0 1rem;
    border-bottom: 1px solid var(--border);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 0;
    width: 100%;
    color: var(--foreground);
    text-decoration: none;
  }

  .brand-mark {
    display: inline-flex;
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: calc(var(--radius) - 2px);
    background: var(--foreground);
    color: var(--background);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .brand-wordmark {
    min-width: 0;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-nav {
    flex: 1;
    display: grid;
    align-content: start;
    gap: 0.25rem;
    padding: 0.9rem 0.75rem;
    min-height: 0;
  }

  .nav-item {
    display: flex;
    min-height: 40px;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    color: var(--muted-foreground);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .nav-item:hover {
    background: color-mix(in srgb, var(--sidebar-accent) 58%, transparent);
    color: var(--foreground);
  }

  .nav-item.active {
    background: var(--sidebar-accent);
    color: var(--foreground);
    box-shadow: var(--shadow-inline-control);
  }

  .nav-item:focus-visible,
  .brand:focus-visible,
  .plan-card:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .nav-icon {
    display: inline-flex;
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
  }

  .nav-icon svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .nav-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-badge {
    flex: 0 0 auto;
  }

  .sidebar-footer {
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border-top: 1px solid var(--border);
  }

  .sidebar.collapsed .sidebar-header {
    justify-content: center;
    padding: 0 0.75rem;
  }

  .sidebar.collapsed .brand {
    justify-content: center;
  }

  .sidebar.collapsed .brand-wordmark,
  .sidebar.collapsed .nav-label,
  .sidebar.collapsed :global(.nav-badge),
  .sidebar.collapsed .footer-links,
  .sidebar.collapsed .plan-card,
  .sidebar.collapsed .language-card {
    display: none;
  }

  .sidebar.collapsed .sidebar-nav {
    padding-inline: 0.625rem;
  }

  .sidebar.collapsed .nav-item {
    justify-content: center;
    gap: 0;
    padding-inline: 0.75rem;
  }

  .sidebar.collapsed .sidebar-footer {
    padding: 0.75rem;
    min-height: 0;
  }

  .footer-links {
    display: grid;
    gap: 0.25rem;
  }

  .footer-link {
    min-height: 36px;
  }

  .plan-card {
    display: grid;
    gap: 0.2rem;
    padding: 0.85rem 0.9rem;
    border-radius: 0.95rem;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    background: color-mix(in srgb, var(--sidebar-accent) 72%, transparent);
    box-shadow: var(--shadow-inline-control);
    color: var(--foreground);
    text-decoration: none;
  }

  .plan-card:hover {
    background: var(--sidebar-accent);
  }

  .plan-label,
  .plan-value {
    margin: 0;
  }

  .plan-label {
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  .plan-value {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .language-card {
    display: grid;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    border-radius: 0.95rem;
    background: color-mix(in srgb, var(--sidebar-accent) 62%, transparent);
    box-shadow: var(--shadow-inline-control);
  }

  .language-title,
  .language-description {
    margin: 0;
  }

  .language-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--foreground);
  }

  .language-description {
    margin-top: 0.2rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  .language-card :global(.language-toggle) {
    width: 100%;
    justify-content: space-between;
  }

  @media (max-width: 767px) {
    .sidebar {
      display: none;
    }
  }
</style>
