<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let items = [];
  export let value = '';
  export let ariaLabel = 'Tabs';
  export let fullWidth = false;
  export let stacked = false;
  export let mobileScrollable = false;
  export let size = 'md';
  export let className = '';

  $: normalizedItems = Array.isArray(items) ? items : [];
  $: selectedValue = value || normalizedItems[0]?.value || '';
  $: resolvedClass = [
    'ui-tabs',
    `ui-tabs--${size}`,
    fullWidth ? 'ui-tabs--full-width' : '',
    stacked ? 'ui-tabs--stacked' : '',
    mobileScrollable ? 'ui-tabs--mobile-scrollable' : '',
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
    gap: 0.3rem;
    align-items: center;
    padding: 0.25rem;
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--ui-border-subtle);
    background: rgba(255, 255, 255, 0.02);
  }

  .ui-tabs--full-width {
    width: 100%;
  }

  .ui-tabs--full-width .ui-tabs__tab {
    width: 100%;
  }

  .ui-tabs__tab {
    min-height: 32px;
    border: 1px solid transparent;
    border-radius: var(--ui-radius-sm);
    padding: 0.35rem 0.62rem;
    background: transparent;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.28rem;
    font: inherit;
    font-size: var(--font-size-xs);
    font-weight: 500;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  .ui-tabs__tab:hover:not(:disabled) {
    color: var(--color-text-primary);
    border-color: var(--ui-border-subtle);
    background: color-mix(in srgb, var(--ui-surface-raised) 82%, transparent);
  }

  .ui-tabs__tab:active:not(:disabled) {
    background: color-mix(in srgb, var(--ui-surface-raised) 74%, transparent);
  }

  .ui-tabs__tab:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .ui-tabs__tab[aria-selected='true'] {
    color: var(--color-text-primary);
    border-color: var(--ui-border-accent);
    background: rgba(255, 255, 255, 0.05);
  }

  .ui-tabs__tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ui-tabs--sm .ui-tabs__tab {
    min-height: 28px;
    border-radius: var(--ui-radius-sm);
    font-size: 0.69rem;
    padding: 0.25rem 0.52rem;
  }

  .ui-tabs--lg .ui-tabs__tab {
    min-height: var(--ui-control-height-md);
    padding: 0.42rem 0.72rem;
    font-size: var(--font-size-sm);
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

  @media (max-width: 640px) {
    .ui-tabs--mobile-scrollable {
      width: 100%;
      max-width: 100%;
      display: flex;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .ui-tabs--mobile-scrollable::-webkit-scrollbar {
      display: none;
    }

    .ui-tabs--mobile-scrollable .ui-tabs__tab {
      flex: 0 0 auto;
      white-space: nowrap;
    }
  }

  @media (max-width: 520px) {
    .ui-tabs--stacked .ui-tabs__tab {
      flex-direction: row;
      gap: 0.3rem;
    }
  }
</style>
