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
  export let variant = 'pill';
  export let className = '';

  $: normalizedItems = Array.isArray(items) ? items : [];
  $: selectedValue = value || normalizedItems[0]?.value || '';
  $: resolvedClass = [
    'ui-tabs',
    variant === 'underline'
      ? 'flex items-end gap-5 border-b border-border bg-transparent p-0'
      : 'inline-flex items-center gap-1 rounded-xl border border-border bg-muted/70 p-[4px] text-muted-foreground shadow-inline-control',
    fullWidth ? 'w-full' : 'w-fit',
    'max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none]',
    className,
    $$props.class ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  function select(nextValue) {
    if (!nextValue || nextValue === selectedValue) return;
    dispatch('change', { value: nextValue });
  }
</script>

<div
  {...$$restProps}
  class={resolvedClass}
  data-variant={variant}
  data-size={size}
  data-full-width={fullWidth}
  data-stacked={stacked}
  role="tablist"
  aria-label={ariaLabel}
>
  {#each normalizedItems as item}
    <button
      type="button"
      class={`ui-tabs__tab ${fullWidth ? 'flex-1' : ''} ${variant === 'underline'
        ? 'relative inline-flex min-h-0 items-center justify-center gap-1.5 border-0 bg-transparent px-0 pb-3 pt-0 text-sm shadow-none appearance-none'
        : 'inline-flex h-[calc(100%-1px)] min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md border border-transparent px-3.5 py-1.5 text-sm shadow-none'}`}
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
    -webkit-overflow-scrolling: touch;
  }

  .ui-tabs::-webkit-scrollbar {
    display: none;
  }

  .ui-tabs__tab {
    color: var(--ui-text-muted);
    font: inherit;
    font-weight: 500;
    white-space: nowrap;
    outline: none;
    transition:
      color var(--motion-fast) var(--ease-standard),
      background-color var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  .ui-tabs[data-variant='pill'] .ui-tabs__tab:hover:not(:disabled) {
    color: var(--ui-text-primary);
    background: var(--ui-surface-ghost);
  }

  .ui-tabs[data-variant='pill'] .ui-tabs__tab[aria-selected='true'] {
    background: var(--ui-surface-card);
    border-color: var(--ui-border-strong);
    color: var(--ui-text-primary);
    box-shadow: var(--ui-shadow-1);
  }

  .ui-tabs[data-variant='underline'] .ui-tabs__tab:hover:not(:disabled) {
    color: var(--ui-text-primary);
    background: transparent;
  }

  .ui-tabs[data-variant='underline'] .ui-tabs__tab {
    color: var(--ui-text-secondary);
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .ui-tabs[data-variant='underline'] .ui-tabs__tab[aria-selected='true'] {
    color: var(--ui-text-primary);
    font-weight: 600;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  .ui-tabs[data-variant='underline'] .ui-tabs__tab[aria-selected='true']::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: -1px;
    height: 2px;
    background: var(--ui-progress-fill);
    transition: transform var(--motion-default) var(--ease-standard),
      opacity var(--motion-default) var(--ease-standard);
  }

  .ui-tabs__tab:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 32%, transparent);
    border-radius: calc(var(--radius) - 2px);
  }

  .ui-tabs[data-variant='underline'] .ui-tabs__tab:focus-visible {
    border-radius: 0;
  }

  .ui-tabs__tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ui-tabs[data-size='sm'] .ui-tabs__tab {
    min-height: 44px;
    min-width: 44px;
    padding-inline: 0.625rem;
    font-size: 0.75rem;
  }

  .ui-tabs[data-size='lg'] .ui-tabs__tab {
    min-height: 44px;
    min-width: 44px;
    padding-inline: 1rem;
    font-size: 0.875rem;
  }

  .ui-tabs[data-stacked='true'] .ui-tabs__tab {
    flex-direction: column;
    gap: 0.1rem;
    line-height: 1.1;
  }

  .ui-tabs__meta {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.86;
  }

  @media (max-width: 520px) {
    .ui-tabs[data-stacked='true'] .ui-tabs__tab {
      flex-direction: row;
      gap: 0.3rem;
    }
  }
</style>
