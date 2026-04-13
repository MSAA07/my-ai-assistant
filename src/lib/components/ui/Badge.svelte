<script>
  export let tone = 'neutral';
  export let variant = 'soft';
  export let size = 'sm';
  export let uppercase = false;
  export let className = '';

  const toneAliases = {
    danger: 'destructive',
  };

  const sizeClasses = {
    xs: 'min-h-[18px] px-2 py-0.5 text-[11px]',
    sm: 'min-h-[22px] px-2 py-0.5 text-xs',
    md: 'min-h-[26px] px-2.5 py-1 text-sm',
  };

  $: normalizedTone = toneAliases[tone] ?? tone;
  $: normalizedSize = sizeClasses[size] ? size : 'sm';
  $: resolvedClass = [
    'ui-badge inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-[color:var(--badge-border)] bg-[color:var(--badge-bg)] text-[color:var(--badge-fg)] font-medium leading-none transition-[background-color,border-color,color,box-shadow] transition-fast',
    sizeClasses[normalizedSize],
    uppercase ? 'uppercase tracking-[0.08em]' : '',
    className,
    $$props.class ?? '',
  ]
    .filter(Boolean)
    .join(' ');
</script>

<span
  {...$$restProps}
  class={resolvedClass}
  data-tone={normalizedTone}
  data-variant={variant}
  data-size={normalizedSize}
>
  <slot />
</span>

<style>
  .ui-badge {
    --badge-bg: color-mix(in srgb, var(--ui-surface-secondary) 78%, transparent);
    --badge-border: var(--ui-border-default);
    --badge-fg: var(--ui-text-primary);
    border-radius: var(--ui-radius-sm);
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .ui-badge[data-variant='outline'] {
    --badge-bg: transparent;
    --badge-border: var(--ui-border-default);
  }

  .ui-badge[data-variant='solid'] {
    --badge-border: transparent;
  }

  .ui-badge[data-tone='neutral'] {
    --badge-bg: color-mix(in srgb, var(--ui-surface-secondary) 90%, var(--ui-surface-card) 10%);
    --badge-border: var(--ui-border-default);
    --badge-fg: var(--ui-text-secondary);
  }

  .ui-badge[data-tone='accent'] {
    --badge-bg: var(--ui-surface-ghost);
    --badge-border: var(--ui-border-default);
    --badge-fg: var(--ui-text-primary);
  }

  .ui-badge[data-tone='info'] {
    --badge-bg: color-mix(in srgb, var(--ui-accent-info) 12%, transparent);
    --badge-border: color-mix(in srgb, var(--ui-accent-info) 26%, var(--ui-border-default) 74%);
    --badge-fg: color-mix(in srgb, var(--ui-accent-info) 82%, var(--ui-text-primary) 18%);
  }

  .ui-badge[data-tone='success'] {
    --badge-bg: color-mix(in srgb, var(--ui-accent-success) 12%, transparent);
    --badge-border: color-mix(in srgb, var(--ui-accent-success) 26%, var(--ui-border-default) 74%);
    --badge-fg: color-mix(in srgb, var(--ui-accent-success) 84%, var(--ui-text-primary) 16%);
  }

  .ui-badge[data-tone='warning'] {
    --badge-bg: color-mix(in srgb, var(--ui-accent-warning) 16%, transparent);
    --badge-border: color-mix(in srgb, var(--ui-accent-warning) 28%, var(--ui-border-default) 72%);
    --badge-fg: color-mix(in srgb, var(--ui-accent-warning) 84%, var(--ui-text-primary) 16%);
  }

  .ui-badge[data-tone='destructive'] {
    --badge-bg: color-mix(in srgb, var(--ui-accent-danger) 12%, transparent);
    --badge-border: color-mix(in srgb, var(--ui-accent-danger) 28%, var(--ui-border-default) 72%);
    --badge-fg: color-mix(in srgb, var(--ui-accent-danger) 84%, var(--ui-text-primary) 16%);
  }

  .ui-badge[data-variant='solid'][data-tone='neutral'] {
    --badge-bg: var(--ui-text-primary);
    --badge-fg: var(--ui-bg-page);
    --badge-border: transparent;
  }

  .ui-badge[data-variant='solid'][data-tone='accent'] {
    --badge-bg: var(--ui-text-primary);
    --badge-fg: var(--ui-bg-page);
    --badge-border: transparent;
  }

  .ui-badge[data-variant='solid'][data-tone='info'] {
    --badge-bg: var(--info);
    --badge-fg: var(--info-foreground);
  }

  .ui-badge[data-variant='solid'][data-tone='success'] {
    --badge-bg: var(--success);
    --badge-fg: var(--success-foreground);
  }

  .ui-badge[data-variant='solid'][data-tone='warning'] {
    --badge-bg: var(--warning);
    --badge-fg: var(--warning-foreground);
  }

  .ui-badge[data-variant='solid'][data-tone='destructive'] {
    --badge-bg: var(--destructive);
    --badge-fg: var(--destructive-foreground);
  }
</style>
