<script>
  export let as = 'div';
  export let variant = 'base';
  export let padding = 'md';
  export let border = 'subtle';
  export let hoverable = false;
  export let className = '';

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-7',
    xl: 'p-8',
  };

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
  data-variant={variant}
  data-border={border}
  data-padding={normalizedPadding}
  data-hoverable={hoverable}
>
  <slot />
</svelte:element>

<style>
  .ui-card {
    --card-bg: var(--card);
    --card-fg: var(--card-foreground);
    --card-border-color: var(--border);
    --card-shadow: var(--shadow-card);
    --card-gap: 1rem;
    --card-hover-border: color-mix(in srgb, var(--muted-foreground) 30%, transparent);
    --card-hover-bg: color-mix(in srgb, var(--accent) 58%, transparent);
    --card-hover-shadow: var(--shadow-card);
  }

  .ui-card[data-variant='base'] {
    --card-bg: var(--card);
    --card-shadow: var(--shadow-card);
  }

  .ui-card[data-variant='raised'] {
    --card-bg: color-mix(in srgb, var(--card) 55%, var(--muted) 45%);
    --card-shadow: var(--shadow-card);
  }

  .ui-card[data-variant='soft'] {
    --card-bg: color-mix(in srgb, var(--muted) 62%, transparent);
    --card-shadow: none;
  }

  .ui-card[data-variant='overlay'] {
    --card-bg: var(--popover);
    --card-fg: var(--popover-foreground);
    --card-shadow: var(--shadow-popover);
  }

  .ui-card[data-border='none'] {
    --card-border-color: transparent;
  }

  .ui-card[data-border='subtle'] {
    --card-border-color: var(--border);
  }

  .ui-card[data-border='strong'] {
    --card-border-color: color-mix(in srgb, var(--foreground) 14%, var(--border) 86%);
  }

  .ui-card[data-border='accent'] {
    --card-border-color: color-mix(in srgb, var(--foreground) 18%, var(--border) 82%);
  }

  .ui-card[data-border='dashed'] {
    border-style: dashed;
  }
</style>
