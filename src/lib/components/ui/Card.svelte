<script>
  export let as = 'div';
  export let variant = 'base';
  export let padding = 'md';
  export let border = 'subtle';
  export let hoverable = false;
  export let className = '';

  const variantAliases = {
    base: 'standard',
    raised: 'secondary',
    soft: 'secondary',
  };

  const borderAliases = {
    subtle: 'default',
    accent: 'strong',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-7',
    xl: 'p-8',
  };

  $: normalizedVariant = variantAliases[variant] ?? variant;
  $: normalizedBorder = borderAliases[border] ?? border;
  $: normalizedPadding = paddingClasses[padding] ? padding : 'md';
  $: resolvedClass = [
    'ui-card min-w-0 rounded-xl border border-[color:var(--card-border-color)] bg-[color:var(--card-bg)] text-[color:var(--card-fg)] shadow-[var(--card-shadow)]',
    'flex flex-col gap-[var(--card-gap)]',
    hoverable
      ? 'transition-[background-color,border-color,box-shadow] transition-default hover:border-[color:var(--card-hover-border)] hover:bg-[color:var(--card-hover-bg)] hover:shadow-[var(--card-hover-shadow)]'
      : '',
    paddingClasses[normalizedPadding],
    className,
    $$props.class ?? '',
  ]
    .filter(Boolean)
    .join(' ');
</script>

<svelte:element
  {...$$restProps}
  this={as}
  class={resolvedClass}
  data-variant={normalizedVariant}
  data-border={normalizedBorder}
  data-padding={normalizedPadding}
  data-hoverable={hoverable}
  on:click
  on:keydown
>
  <slot />
</svelte:element>

<style>
  .ui-card {
    --card-bg: var(--ui-surface-card);
    --card-fg: var(--ui-text-primary);
    --card-border-color: var(--ui-border-default);
    --card-shadow: none;
    --card-gap: var(--ui-space-4);
    --card-hover-border: var(--ui-border-strong);
    --card-hover-bg: color-mix(in srgb, var(--ui-surface-card) 90%, var(--ui-text-primary) 10%);
    --card-hover-shadow: none;
    border-radius: var(--ui-radius-md);
  }

  .ui-card[data-variant='standard'] {
    --card-bg: var(--ui-surface-card);
    --card-shadow: none;
  }

  .ui-card[data-variant='secondary'] {
    --card-bg: color-mix(in srgb, var(--ui-surface-secondary) 80%, var(--ui-surface-card) 20%);
    --card-shadow: none;
  }

  .ui-card[data-variant='study'] {
    --card-bg: var(--ui-surface-study);
    --card-shadow: none;
  }

  .ui-card[data-variant='ghost'] {
    --card-bg: color-mix(in srgb, var(--ui-surface-secondary) 62%, transparent);
    --card-shadow: none;
  }

  .ui-card[data-variant='overlay'] {
    --card-bg: var(--ui-surface-overlay);
    --card-fg: var(--ui-text-primary);
    --card-shadow: var(--ui-shadow-1);
  }

  .ui-card[data-border='none'] {
    --card-border-color: transparent;
  }

  .ui-card[data-border='default'] {
    --card-border-color: var(--ui-border-default);
  }

  .ui-card[data-border='strong'] {
    --card-border-color: var(--ui-border-strong);
  }

  .ui-card[data-border='dashed'] {
    border-style: dashed;
  }
</style>
