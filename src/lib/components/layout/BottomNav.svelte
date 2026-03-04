<script>
  import { direction } from '../../stores/language.js';
  import { t } from '../../i18n/t.js';

  export let items = [];
  export let activeId = '';
</script>

<nav class={`bottom-nav ${$direction === 'rtl' ? 'rtl' : 'ltr'}`} aria-label={t('nav.mobileLabel')}>
  {#each items as item}
    <a
      class={`bottom-nav-item ${activeId === item.id ? 'active' : ''}`}
      href={item.href}
      aria-current={activeId === item.id ? 'page' : undefined}
    >
      <span class="icon">
        {#if item.icon === 'dashboard'}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.75A1.75 1.75 0 0 1 5.25 11h5.5A1.75 1.75 0 0 1 12.5 12.75v6.5A1.75 1.75 0 0 1 10.75 21h-5.5A1.75 1.75 0 0 1 3.5 19.25v-6.5Zm9-8A1.75 1.75 0 0 1 14.25 3h4.5A1.75 1.75 0 0 1 20.5 4.75v4.5A1.75 1.75 0 0 1 18.75 11h-4.5A1.75 1.75 0 0 1 12.5 9.25v-4.5Z" /></svg>
        {:else if item.icon === 'documents'}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2.75A2.75 2.75 0 0 0 4.25 5.5v13A2.75 2.75 0 0 0 7 21.25h10A2.75 2.75 0 0 0 19.75 18.5V9.81a2.75 2.75 0 0 0-.81-1.94l-4.06-4.06A2.75 2.75 0 0 0 12.94 3H7Zm9.5 6.75H13a1 1 0 0 1-1-1V4.5" /></svg>
        {:else if item.icon === 'exams'}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 4.25A2.25 2.25 0 0 1 7.75 2h8.5A2.25 2.25 0 0 1 18.5 4.25v15.5a.25.25 0 0 1-.38.21L12 16.65l-6.12 3.31a.25.25 0 0 1-.38-.21V4.25Z" /></svg>
        {:else if item.icon === 'flashcards'}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.75 5.5A2.75 2.75 0 0 1 7.5 2.75h11A2.75 2.75 0 0 1 21.25 5.5v9a2.75 2.75 0 0 1-2.75 2.75h-11A2.75 2.75 0 0 1 4.5 14.5v-9Zm-2 4.75A2.25 2.25 0 0 1 5 8H6v6.5a4.25 4.25 0 0 0 4.25 4.25h8.5a2.25 2.25 0 0 1-2.25 2.25h-11A2.25 2.25 0 0 1 3 18.75v-8.5Z" /></svg>
        {:else if item.icon === 'admin'}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3.25 3.25 0 0 1 2.79 1.58l.38.63 2.37.46a3.25 3.25 0 0 1 2.6 3.53l-.09.73.57.9a3.25 3.25 0 0 1-.55 4.08l-.58.59.1.82a3.25 3.25 0 0 1-2.62 3.53l-2.37.46-.38.63a3.25 3.25 0 0 1-5.58 0l-.38-.63-2.37-.46a3.25 3.25 0 0 1-2.6-3.53l.09-.73-.57-.9a3.25 3.25 0 0 1 .55-4.08l.58-.59-.1-.82a3.25 3.25 0 0 1 2.62-3.53l2.37-.46.38-.63A3.25 3.25 0 0 1 12 2Z" /></svg>
        {/if}
      </span>
      <span class="label">{item.label}</span>
      {#if item.badge}
        <span class={`badge ${item.badge.variant ?? ''}`}>{item.badge.label}</span>
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
    background: var(--color-surface-overlay);
    backdrop-filter: blur(16px);
    border-top: 1px solid var(--color-border);
    padding: var(--space-2);
  }

  .bottom-nav.ltr {
    flex-direction: row;
  }

  .bottom-nav.rtl {
    flex-direction: row-reverse;
  }

  .bottom-nav {
    display: flex;
    justify-content: space-around;
  }

  .bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-height: 56px;
    padding: var(--space-1);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: var(--radius-1);
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .bottom-nav-item.active {
    color: var(--color-text-primary);
    background: var(--color-accent-surface);
  }

  .icon {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  .label {
    font-size: 0.75rem;
  }

  .badge {
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    font-size: 0.7rem;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }

  .badge.info {
    border-color: var(--color-info);
    color: var(--color-info);
  }

  .badge.success {
    border-color: var(--color-success);
    color: var(--color-success);
  }

  @media (max-width: 768px) {
    .bottom-nav {
      display: flex;
    }
  }
</style>
