<script>
  import { createEventDispatcher } from 'svelte';
  import { direction } from '../../stores/language.js';

  export let items = [];
  export let secondaryItems = [];
  export let activeId = '';
  export let plan = { label: '', badge: '', variant: 'free' };

  const dispatch = createEventDispatcher();

  const handleClick = (event, item) => {
    event.preventDefault();
    dispatch('navigate', { item });
  };

  const planVariant = () => {
    switch (plan.variant) {
      case 'pro':
        return 'pro';
      case 'free':
      default:
        return 'free';
    }
  };
</script>

<aside class="sidebar" role="navigation" aria-label="App sidebar">
  <div class="sidebar__inner" data-dir={$direction}>
    <header class="sidebar__header">
      <slot name="logo">
        <span class="sidebar__brand">AI Study</span>
      </slot>
    </header>

    <nav class="sidebar__section" aria-label="Primary navigation">
      {#each items as item (item.id)}
        <button
          type="button"
          class:active={item.id === activeId}
          class="sidebar__item"
          on:click={(event) => handleClick(event, item)}
        >
          {#if item.icon}
            <span class="sidebar__icon" aria-hidden="true">
              <svelte:component this={item.icon} />
            </span>
          {/if}
          <span class="sidebar__label">{item.label}</span>
          {#if item.badge}
            <span class="sidebar__pill">{item.badge}</span>
          {/if}
        </button>
      {/each}
    </nav>

    {#if secondaryItems.length > 0}
      <nav class="sidebar__section" aria-label="Secondary navigation">
        {#each secondaryItems as item (item.id)}
          <button
            type="button"
            class:active={item.id === activeId}
            class="sidebar__item sidebar__item--secondary"
            on:click={(event) => handleClick(event, item)}
          >
            {#if item.icon}
              <span class="sidebar__icon" aria-hidden="true">
                <svelte:component this={item.icon} />
              </span>
            {/if}
            <span class="sidebar__label">{item.label}</span>
          </button>
        {/each}
      </nav>
    {/if}

    <footer class="sidebar__footer">
      <slot name="footer">
        <div class="sidebar__plan" data-variant={planVariant()}>
          <div class="sidebar__plan-label">{plan.label}</div>
          {#if plan.badge}
            <span class="sidebar__plan-badge">{plan.badge}</span>
          {/if}
        </div>
      </slot>
    </footer>
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    inset-block: 0;
    inset-inline-start: 0;
    width: var(--size-sidebar);
    background: var(--color-sidebar);
    border-inline-end: 1px solid var(--color-border);
    display: none;
  }

  .sidebar__inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    height: 100%;
    padding: var(--space-5) var(--space-4);
    color: var(--color-text-primary);
  }

  .sidebar__header {
    min-block-size: 48px;
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .sidebar__brand {
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .sidebar__section {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .sidebar__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0 var(--space-3);
    min-block-size: 48px;
    border: none;
    border-radius: var(--radius-1);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      border var(--motion-fast) var(--ease-standard);
    cursor: pointer;
  }

  .sidebar__item:hover,
  .sidebar__item:focus-visible {
    background: var(--color-surface-2);
    outline: none;
  }

  .sidebar__item.active {
    background: var(--color-surface-2);
    border-inline-start: 3px solid var(--color-accent-primary);
    color: var(--color-text-primary);
  }

  .sidebar__item--secondary {
    color: var(--color-text-muted);
  }

  .sidebar__item--secondary.active {
    color: var(--color-text-primary);
  }

  .sidebar__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 24px;
  }

  .sidebar__label {
    flex: 1;
  }

  .sidebar__pill {
    padding: 0 var(--space-2);
    border-radius: 9999px;
    background: var(--color-surface-2);
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .sidebar__footer {
    margin-top: auto;
  }

  .sidebar__plan {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-1);
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
  }

  .sidebar__plan[data-variant='pro'] {
    border-color: var(--color-accent-secondary);
  }

  .sidebar__plan-label {
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .sidebar__plan-badge {
    padding: 0 var(--space-2);
    min-inline-size: 44px;
    inline-size: auto;
    text-align: center;
    border-radius: 999px;
    background: var(--color-accent-bg);
    color: var(--color-accent-primary);
    font-weight: 600;
    font-size: 0.8rem;
  }

  @media (max-width: 767px) {
    .sidebar {
      display: none;
    }
  }

  @media (min-width: 768px) {
    .sidebar {
      display: block;
    }
  }

  :global(html[dir='rtl']) .sidebar {
    inset-inline-start: auto;
    inset-inline-end: 0;
    border-inline-end: none;
    border-inline-start: 1px solid var(--color-border);
  }

  :global(html[dir='rtl']) .sidebar__item.active {
    border-inline-start: none;
    border-inline-end: 3px solid var(--color-accent-primary);
  }
</style>
