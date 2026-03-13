<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let checked = false;
  export let disabled = false;
  export let size = 'md';
  export let label = '';
  export let className = '';

  const sizeClasses = {
    sm: 'h-4 w-7',
    md: 'h-[1.15rem] w-8',
  };

  function toggle() {
    if (disabled) return;
    dispatch('change', { checked: !checked });
  }

  function handleKeydown(event) {
    if (disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggle();
    }
  }

  $: normalizedSize = sizeClasses[size] ? size : 'md';
  $: resolvedClass = [
    'ui-toggle inline-flex items-center gap-3 text-sm text-foreground',
    className,
    $$props.class ?? '',
  ]
    .filter(Boolean)
    .join(' ');
</script>

<button
  {...$$restProps}
  type="button"
  class={resolvedClass}
  data-size={normalizedSize}
  role="switch"
  aria-checked={checked}
  aria-disabled={disabled}
  disabled={disabled}
  on:click={toggle}
  on:keydown={handleKeydown}
>
  <span
    class={`ui-toggle__control ${sizeClasses[normalizedSize]} inline-flex shrink-0 items-center rounded-full border border-transparent bg-[color:var(--toggle-bg)] shadow-inline-control p-[1px] transition-[background-color,box-shadow] transition-default ${
      checked ? 'justify-end' : 'justify-start'
    }`}
  >
    <span class="ui-toggle__thumb block size-4 rounded-full bg-[color:var(--toggle-thumb)] transition-transform transition-default"></span>
  </span>

  {#if label || $$slots.default}
    <span class="ui-toggle__label">
      <slot>{label}</slot>
    </span>
  {/if}
</button>

<style>
  .ui-toggle {
    --toggle-bg: var(--muted);
    --toggle-thumb: var(--background);
  }

  .ui-toggle[aria-checked='true'] {
    --toggle-bg: var(--primary);
    --toggle-thumb: var(--primary-foreground);
  }

  .ui-toggle:focus-visible {
    outline: none;
  }

  .ui-toggle:focus-visible .ui-toggle__control {
    box-shadow:
      var(--shadow-inline-control),
      0 0 0 3px color-mix(in srgb, var(--ring) 32%, transparent);
  }

  .ui-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .ui-toggle__label {
    color: var(--foreground);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .ui-toggle[data-size='sm'] .ui-toggle__thumb {
    width: 0.75rem;
    height: 0.75rem;
  }
</style>
