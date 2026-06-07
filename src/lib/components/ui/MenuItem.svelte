<script>
  export let type = 'button';
  export let tone = 'default';
  export let disabled = false;
  export let className = '';

  $: resolvedClass = [
    'ui-menu-item',
    `ui-menu-item--${tone}`,
    className,
    $$props.class ?? ''
  ]
    .filter(Boolean)
    .join(' ');
</script>

<button
  {...$$restProps}
  {type}
  class={resolvedClass}
  role="menuitem"
  {disabled}
  on:click|stopPropagation
>
  <slot />
</button>

<style>
  .ui-menu-item {
    width: 100%;
    min-height: 44px;
    border: 1px solid transparent;
    border-radius: var(--ui-radius-sm);
    background: transparent;
    color: var(--color-text-secondary);
    font: inherit;
    font-size: var(--font-size-xs);
    font-weight: 500;
    padding: 0.75rem 0.5rem;
    text-align: start;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .ui-menu-item:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ui-surface-raised) 82%, transparent);
    border-color: var(--ui-border-subtle);
    color: var(--color-text-primary);
  }

  .ui-menu-item:active:not(:disabled) {
    background: color-mix(in srgb, var(--ui-surface-raised) 74%, transparent);
  }

  .ui-menu-item:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .ui-menu-item:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .ui-menu-item--danger {
    color: color-mix(in srgb, var(--color-danger) 72%, var(--color-text-primary) 28%);
  }
</style>
