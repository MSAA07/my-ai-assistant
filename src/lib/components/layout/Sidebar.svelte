<script>
  import {
    BookOpen,
    ClipboardCheck,
    House,
    Layers,
    Settings,
    ShieldCheck,
  } from '@lucide/svelte';
  import { direction } from '../../stores/language.js';
  import Badge from '../ui/Badge.svelte';
  import { t } from '../../i18n/t.js';

  export let items = [];
  export let secondaryItems = [];
  export let activeId = '';
  export let collapsed = false;

  const badgeToneMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'danger',
    accent: 'accent',
  };

  const iconMap = {
    dashboard: House,
    documents: BookOpen,
    flashcards: Layers,
    exams: ClipboardCheck,
    settings: Settings,
    admin: ShieldCheck,
  };

  $: footerItems = secondaryItems.filter((item) => item.icon !== 'plan');

  function labelFor(item) {
    return item?.labelKey ? t(item.labelKey) : item?.label ?? '';
  }
</script>

<aside
  class={`sidebar ${$direction === 'rtl' ? 'rtl' : 'ltr'} ${collapsed ? 'collapsed' : ''}`}
  aria-label={t('nav.mobileLabel')}
>
  <div class="sidebar-header">
    <a class="brand" href="#/home" aria-label={t('app.wordmark')}>
      <span class="brand-wordmark">{t('app.wordmark')}</span>
    </a>
  </div>

  <nav class="sidebar-nav">
    {#each items as item}
      {@const IconComponent = iconMap[item.icon]}
      <a
        class={`nav-item ${activeId === item.id ? 'active' : ''}`}
        href={item.href}
        aria-current={activeId === item.id ? 'page' : undefined}
        aria-label={collapsed ? labelFor(item) : undefined}
        title={collapsed ? labelFor(item) : undefined}
      >
        <span class="nav-icon" aria-hidden="true">
          {#if IconComponent}
            <svelte:component this={IconComponent} size={16} strokeWidth={1.75} />
          {/if}
        </span>

        <span class="nav-label">{labelFor(item)}</span>

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
            <span class="nav-label">{labelFor(item)}</span>
          </a>
        {/each}
      </div>
    {/if}

  </div>
</aside>

<style>
  .sidebar {
    position: sticky;
    top: 0;
    inset-inline-start: auto;
    z-index: 20;
    box-sizing: border-box;
    display: flex;
    height: 100dvh;
    width: var(--shell-sidebar-width, 15rem);
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-gutter: stable;
    background: color-mix(in srgb, var(--sidebar, var(--ui-surface-card)) 96%, black);
    border-inline-end: 1px solid var(--ui-border-default);
    transition: width var(--motion-default) var(--ease-standard);
  }

  .sidebar.rtl {
    border-inline-end: none;
    border-inline-start: 1px solid var(--ui-border-default);
  }

  .sidebar-header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    min-height: var(--size-topbar);
    align-items: center;
    padding: 0 var(--ui-space-4);
    border-bottom: 1px solid var(--ui-border-default);
    background: inherit;
    backdrop-filter: blur(10px);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    width: 100%;
    color: var(--ui-text-primary);
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .brand-wordmark {
    min-width: 0;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-nav {
    flex: 1;
    display: grid;
    align-content: start;
    gap: 0.125rem;
    padding: 0.75rem;
    min-height: 0;
  }

  .nav-item {
    display: flex;
    min-height: 44px;
    align-items: center;
    gap: 0.625rem;
    padding: 0.375rem 0.625rem;
    border-radius: var(--ui-radius-sm);
    color: var(--ui-text-muted);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    user-select: none;
    -webkit-user-select: none;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .nav-item:hover {
    background: color-mix(in srgb, var(--ui-text-primary) 5%, transparent);
    color: var(--ui-text-primary);
  }

  .nav-item.active {
    background: color-mix(in srgb, var(--ui-text-primary) 8%, transparent);
    color: var(--ui-text-primary);
  }

  .nav-item:focus-visible,
  .brand:focus-visible {
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
    gap: 0.5rem;
    padding: 0.75rem 0.75rem calc(0.75rem + env(safe-area-inset-bottom));
    border-top: 1px solid var(--ui-border-default);
  }

  .sidebar.collapsed .sidebar-header {
    justify-content: center;
    padding: 0 0.625rem;
  }

  .sidebar.collapsed .brand {
    justify-content: center;
  }

  .sidebar.collapsed .brand-wordmark,
  .sidebar.collapsed .nav-label,
  .sidebar.collapsed :global(.nav-badge),
  .sidebar.collapsed .footer-links {
    display: none;
  }

  .sidebar.collapsed .sidebar-nav {
    padding-inline: 0.5rem;
  }

  .sidebar.collapsed .nav-item {
    justify-content: center;
    gap: 0;
    padding-inline: 0.625rem;
  }

  .sidebar.collapsed .sidebar-footer {
    padding: 0.625rem;
    min-height: 0;
  }

  .footer-links {
    display: grid;
    gap: 0.125rem;
  }

  .footer-link {
    min-height: 32px;
  }

  @media (max-width: 767px) {
    .sidebar {
      display: none;
    }
  }
</style>
