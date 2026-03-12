<script>
  export let as = 'div';
  export let variant = 'base';
  export let padding = 'md';
  export let border = 'subtle';
  export let hoverable = false;
  export let className = '';

  $: resolvedClass = [
    'ui-card',
    `ui-card--${variant}`,
    `ui-card--padding-${padding}`,
    `ui-card--border-${border}`,
    hoverable ? 'ui-card--hoverable' : '',
    className,
    $$props.class ?? ''
  ]
    .filter(Boolean)
    .join(' ');
</script>

<svelte:element {...$$restProps} this={as} class={resolvedClass}>
  <slot />
</svelte:element>

<style>
  .ui-card {
    --ui-card-bg: var(--ui-surface-base);
    --ui-card-border: var(--ui-border-subtle);
    --ui-card-shadow: none;
    display: grid;
    gap: var(--space-3);
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--ui-card-border);
    background: var(--ui-card-bg);
    box-shadow: var(--ui-card-shadow);
    min-width: 0;
  }

  .ui-card--base {
    --ui-card-bg: var(--ui-surface-base);
    --ui-card-shadow: none;
  }

  .ui-card--raised {
    --ui-card-bg: var(--ui-surface-raised);
    --ui-card-shadow: var(--ui-shadow-sm);
  }

  .ui-card--soft {
    --ui-card-bg: color-mix(in srgb, var(--ui-surface-base) 92%, transparent);
    --ui-card-shadow: none;
  }

  .ui-card--overlay {
    --ui-card-bg: var(--ui-surface-overlay);
    --ui-card-shadow: var(--ui-shadow-md);
  }

  .ui-card--border-none {
    border-color: transparent;
  }

  .ui-card--border-subtle {
    --ui-card-border: var(--ui-border-subtle);
  }

  .ui-card--border-strong {
    --ui-card-border: var(--ui-border-strong);
  }

  .ui-card--border-accent {
    --ui-card-border: var(--ui-border-accent);
  }

  .ui-card--border-dashed {
    border-style: dashed;
  }

  .ui-card--padding-none {
    padding: 0;
  }

  .ui-card--padding-sm {
    padding: var(--space-2);
  }

  .ui-card--padding-md {
    padding: var(--space-4);
  }

  .ui-card--padding-lg {
    padding: var(--space-4);
  }

  .ui-card--hoverable {
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  .ui-card--hoverable:hover {
    border-color: var(--ui-border-accent);
    background: color-mix(in srgb, var(--ui-card-bg) 90%, white 10%);
    box-shadow: var(--ui-shadow-sm);
  }
</style>
