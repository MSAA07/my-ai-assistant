<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let items = [];
  export let value = '';
  export let ariaLabel = 'Tabs';
  export let fullWidth = false;
  export let stacked = false;
  export let size = 'md';
  export let className = '';

  $: normalizedItems = Array.isArray(items) ? items : [];
  $: selectedValue = value || normalizedItems[0]?.value || '';
  $: resolvedClass = [
    'ui-tabs',
    `ui-tabs--${size}`,
    fullWidth ? 'ui-tabs--full-width' : '',
    stacked ? 'ui-tabs--stacked' : '',
    className,
    $$props.class ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  function select(nextValue) {
    if (!nextValue || nextValue === selectedValue) return;
    dispatch('change', { value: nextValue });
  }
</script>

<div {...$$restProps} class={resolvedClass} role="tablist" aria-label={ariaLabel}>
  {#each normalizedItems as item}
    <button
      type="button"
      class="ui-tabs__tab"
      role="tab"
      aria-selected={selectedValue === item.value}
      tabindex={selectedValue === item.value ? 0 : -1}
      disabled={item.disabled}
      on:click={() => select(item.value)}
    >
      {#if item.meta}
        <span class="ui-tabs__meta">{item.meta}</span>
      {/if}
      <span class="ui-tabs__label">{item.label}</span>
    </button>
  {/each}
</div>

<style>
  .ui-tabs {
    display: inline-grid;
    grid-auto-flow: column;
    gap: var(--space-1);
    align-items: center;
    padding: var(--space-1);
    border-radius: calc(var(--ui-radius-md) + 2px);
    border: 1px solid var(--ui-border-subtle);
    background: var(--ui-surface-base);
  }

  .ui-tabs--full-width {
    width: 100%;
  }

  .ui-tabs--full-width .ui-tabs__tab {
    width: 100%;
  }

  .ui-tabs__tab {
    min-height: var(--ui-control-height-md);
    border: 1px solid transparent;
    border-radius: var(--ui-radius-md);
    padding: 0.45rem 0.75rem;
    background: transparent;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    font: inherit;
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  .ui-tabs__tab:hover:not(:disabled) {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--ui-surface-raised) 78%, transparent);
  }

  .ui-tabs__tab:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .ui-tabs__tab[aria-selected='true'] {
    color: var(--color-text-primary);
    border-color: color-mix(in srgb, var(--color-accent-primary) 52%, transparent);
    background: color-mix(in srgb, var(--color-accent-primary) 16%, transparent);
  }

  .ui-tabs__tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ui-tabs--sm .ui-tabs__tab {
    min-height: var(--ui-control-height-sm);
    border-radius: var(--ui-radius-sm);
    font-size: var(--font-size-xs);
    padding: 0.32rem 0.6rem;
  }

  .ui-tabs--lg .ui-tabs__tab {
    min-height: var(--ui-control-height-lg);
    padding: 0.6rem 0.95rem;
    font-size: var(--font-size-md);
  }

  .ui-tabs__meta {
    font-size: var(--font-size-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.86;
  }

  .ui-tabs--stacked .ui-tabs__tab {
    flex-direction: column;
    gap: 0;
    line-height: 1.15;
  }

  .ui-tabs__label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 520px) {
    .ui-tabs--stacked .ui-tabs__tab {
      flex-direction: row;
      gap: 0.3rem;
    }
  }
</style>
