<script>
  export let role = 'menu';
  export let minWidth = '180px';
  export let compact = false;
  export let className = '';

  $: resolvedClass = [
    'ui-menu-surface',
    compact ? 'ui-menu-surface--compact' : '',
    className,
    $$props.class ?? ''
  ]
    .filter(Boolean)
    .join(' ');
</script>

<div
  {...$$restProps}
  class={resolvedClass}
  role={role}
  style={`--ui-menu-min-width: ${minWidth};`}
>
  <slot />
</div>

<style>
  .ui-menu-surface {
    min-width: var(--ui-menu-min-width);
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    background: var(--ui-surface-overlay);
    box-shadow: var(--ui-shadow-md);
    padding: 0.35rem;
    display: grid;
    gap: 0.2rem;
  }

  .ui-menu-surface--compact {
    padding: 0.25rem;
    gap: 0.12rem;
  }
</style>
