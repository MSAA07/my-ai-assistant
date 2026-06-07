<script>
  import {
    BookOpen,
    ClipboardCheck,
    CreditCard,
    House,
    Layers,
    Settings,
    ShieldCheck,
  } from '@lucide/svelte';
  import { direction } from '../../stores/language.js';
  import { t } from '../../i18n/t.js';
  import Badge from '../ui/Badge.svelte';

  export let items = [];
  export let activeId = '';

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
    plan: CreditCard,
    admin: ShieldCheck,
  };

  function labelFor(item) {
    return item?.labelKey ? t(item.labelKey) : item?.label ?? '';
  }
</script>

<nav class={`bottom-nav ${$direction === 'rtl' ? 'rtl' : 'ltr'}`} aria-label={t('nav.mobileLabel')}>
  {#each items as item}
    {@const IconComponent = iconMap[item.icon]}
    <a
      class={`bottom-nav-item ${activeId === item.id ? 'active' : ''}`}
      href={item.href}
      aria-current={activeId === item.id ? 'page' : undefined}
    >
      <span class="icon">
        {#if IconComponent}
          <svelte:component this={IconComponent} size={16} strokeWidth={1.75} />
        {/if}
      </span>
      <span class="label">{labelFor(item)}</span>
      {#if item.badge}
        <Badge className="badge" size="xs" tone={badgeToneMap[item.badge.variant] ?? 'neutral'}>
          {item.badge.label}
        </Badge>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 95;
    display: none;
    pointer-events: none;
    background: color-mix(in srgb, var(--ui-surface-card) 90%, transparent);
    backdrop-filter: blur(10px);
    border-top: 1px solid var(--ui-border-default);
    min-height: var(--size-bottom-nav);
    padding: var(--space-2) var(--space-2) calc(var(--space-1) + env(safe-area-inset-bottom));
    justify-content: space-around;
  }

  .bottom-nav.ltr {
    flex-direction: row;
  }

  .bottom-nav.rtl {
    flex-direction: row-reverse;
  }

  .bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    min-height: 52px;
    padding: 0.35rem var(--space-1);
    color: var(--ui-text-secondary);
    text-decoration: none;
    font-size: var(--font-size-xs);
    font-weight: 500;
    user-select: none;
    -webkit-user-select: none;
    border: 1px solid transparent;
    border-radius: var(--ui-radius-sm);
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .bottom-nav-item:hover {
    border-color: var(--ui-border-subtle);
    background: color-mix(in srgb, var(--ui-text-primary) 5%, transparent);
    color: var(--ui-text-primary);
  }

  .bottom-nav-item.active {
    border-color: var(--ui-border-strong);
    color: var(--ui-text-primary);
    background: var(--ui-surface-ghost);
    box-shadow: none;
  }

  .bottom-nav-item:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .icon {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0;
  }

  .badge {
    letter-spacing: 0;
  }

  @media (max-width: 767px) {
    .bottom-nav {
      display: flex;
      pointer-events: auto;
    }
  }
</style>
