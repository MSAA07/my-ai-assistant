<script>
  import { createEventDispatcher } from 'svelte';

  export let items = [];
  export let activeId = '';

  const dispatch = createEventDispatcher();

  const handleNavigate = (event, item) => {
    event.preventDefault();
    dispatch('navigate', { item });
  };
</script>

<nav class="bottom-nav" aria-label="Mobile navigation">
  {#each items as item (item.id)}
    <button
      type="button"
      class:active={item.id === activeId}
      class="bottom-nav__item"
      on:click={(event) => handleNavigate(event, item)}
    >
      {#if item.icon}
        <span class="bottom-nav__icon" aria-hidden="true">
          <svelte:component this={item.icon} />
        </span>
      {/if}
      <span class="bottom-nav__label">{item.label}</span>
    </button>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    inset-inline: 0;
    inset-block-end: 0;
    display: none;
    padding: var(--space-2) var(--space-3);
    background: color-mix(in srgb, var(--color-bg) 92%, transparent);
    backdrop-filter: blur(18px);
    border-block-start: 1px solid var(--color-border);
    z-index: 12;
  }

  .bottom-nav__item {
    flex: 1;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    min-block-size: 48px;
    border: none;
    border-radius: var(--radius-1);
    background: transparent;
    color: var(--color-text-muted);
    font: inherit;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .bottom-nav__item.active {
    background: var(--color-surface-2);
    color: var(--color-text-primary);
  }

  .bottom-nav__item:hover,
  .bottom-nav__item:focus-visible {
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    outline: none;
  }

  .bottom-nav__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
  }

  .bottom-nav__label {
    font-size: 0.75rem;
  }

  @media (max-width: 767px) {
    .bottom-nav {
      display: flex;
      gap: var(--space-2);
    }
  }

  @media (min-width: 768px) {
    .bottom-nav {
      display: none;
    }
  }
</style>
