<script>
  export let type = 'button';
  export let variant = 'secondary';
  export let size = 'md';
  export let block = false;
  export let loading = false;
  export let disabled = false;
  export let className = '';

  const variantAliases = {
    danger: 'destructive',
    back: 'outline',
  };

  const sizeClasses = {
    sm: 'h-8 rounded-md px-3 text-sm',
    md: 'h-9 rounded-md px-4 py-2 text-sm',
    lg: 'h-10 rounded-md px-6 text-sm',
    icon: 'size-9 rounded-md p-0',
    'icon-sm': 'size-8 rounded-md p-0',
    'icon-lg': 'size-10 rounded-md p-0',
  };

  $: normalizedVariant = variantAliases[variant] ?? variant;
  $: normalizedSize = sizeClasses[size] ? size : 'md';
  $: isDisabled = disabled || loading;
  $: resolvedClass = [
    'ui-button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-[color:var(--button-border)] bg-[color:var(--button-bg)] text-[color:var(--button-fg)] shadow-[var(--button-shadow)] outline-none transition-[background-color,border-color,color,box-shadow,opacity,transform] transition-default disabled:pointer-events-none disabled:opacity-45',
    'hover:border-[color:var(--button-border-hover)] hover:bg-[color:var(--button-bg-hover)] hover:text-[color:var(--button-fg-hover)]',
    'active:bg-[color:var(--button-bg-active)] active:border-[color:var(--button-border-hover)]',
    sizeClasses[normalizedSize],
    block ? 'w-full' : '',
    loading ? 'ui-button--loading' : '',
    className,
    $$props.class ?? '',
  ]
    .filter(Boolean)
    .join(' ');
</script>

<button
  {...$$restProps}
  {type}
  class={resolvedClass}
  data-variant={normalizedVariant}
  data-size={normalizedSize}
  disabled={isDisabled}
  aria-busy={loading}
  on:click
>
  {#if $$slots.icon}
    <span class="ui-button__icon pointer-events-none inline-flex items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-current">
      <slot name="icon" />
    </span>
  {/if}

  {#if $$slots.default}
    <span class="ui-button__label inline-flex items-center justify-center">
      <slot />
    </span>
  {/if}

  {#if loading}
    <span class="ui-button__spinner inline-block size-3 rounded-full border-2 border-[color:color-mix(in_srgb,currentColor_35%,transparent)] border-t-current" aria-hidden="true"></span>
  {/if}
</button>

<style>
  .ui-button {
    --button-bg: var(--ui-surface-secondary);
    --button-bg-hover: color-mix(in srgb, var(--ui-surface-secondary) 82%, var(--ui-text-primary) 18%);
    --button-bg-active: color-mix(in srgb, var(--ui-surface-secondary) 74%, var(--ui-text-primary) 26%);
    --button-fg: var(--ui-text-primary);
    --button-fg-hover: var(--ui-text-primary);
    --button-border: var(--ui-border-default);
    --button-border-hover: var(--ui-border-strong);
    --button-shadow: var(--ui-shadow-1);
    border-radius: var(--ui-radius-sm);
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .ui-button:focus-visible {
    box-shadow: var(--button-shadow), var(--ui-focus-ring-strong);
  }

  .ui-button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .ui-button[data-variant='primary'] {
    --button-bg: var(--ui-text-primary);
    --button-bg-hover: color-mix(in srgb, var(--ui-text-primary) 92%, var(--ui-bg-page) 8%);
    --button-bg-active: color-mix(in srgb, var(--ui-text-primary) 82%, var(--ui-bg-page) 18%);
    --button-fg: var(--ui-bg-page);
    --button-fg-hover: var(--ui-bg-page);
    --button-border: var(--ui-text-primary);
    --button-border-hover: var(--ui-text-primary);
  }

  .ui-button[data-variant='secondary'] {
    --button-bg: color-mix(in srgb, var(--ui-surface-secondary) 90%, var(--ui-surface-card) 10%);
    --button-bg-hover: color-mix(in srgb, var(--ui-surface-secondary) 72%, var(--ui-text-primary) 28%);
    --button-bg-active: color-mix(in srgb, var(--ui-surface-secondary) 66%, var(--ui-text-primary) 34%);
    --button-fg: var(--ui-text-primary);
    --button-fg-hover: var(--ui-text-primary);
    --button-border: var(--ui-border-default);
    --button-border-hover: var(--ui-border-strong);
  }

  .ui-button[data-variant='outline'] {
    --button-bg: color-mix(in srgb, var(--ui-surface-card) 92%, transparent);
    --button-bg-hover: color-mix(in srgb, var(--ui-surface-card) 76%, var(--ui-text-primary) 24%);
    --button-bg-active: color-mix(in srgb, var(--ui-surface-card) 68%, var(--ui-text-primary) 32%);
    --button-fg: var(--ui-text-primary);
    --button-fg-hover: var(--ui-text-primary);
    --button-border: var(--ui-border-default);
    --button-border-hover: var(--ui-border-strong);
    --button-shadow: none;
  }

  .ui-button[data-variant='ghost'] {
    --button-bg: transparent;
    --button-bg-hover: var(--ui-surface-ghost);
    --button-bg-active: var(--ui-surface-ghost-strong);
    --button-fg: var(--ui-text-secondary);
    --button-fg-hover: var(--ui-text-primary);
    --button-border: transparent;
    --button-border-hover: transparent;
    --button-shadow: none;
  }

  .ui-button[data-variant='destructive'] {
    --button-bg: var(--ui-accent-danger);
    --button-bg-hover: var(--ui-accent-danger-hover);
    --button-bg-active: color-mix(in srgb, var(--ui-accent-danger-hover) 84%, black 16%);
    --button-fg: #fff5f5;
    --button-fg-hover: #fff5f5;
    --button-border: var(--ui-accent-danger);
    --button-border-hover: var(--ui-accent-danger-hover);
  }

  .ui-button[data-variant='success'] {
    --button-bg: var(--ui-accent-success-strong);
    --button-bg-hover: var(--ui-accent-success-hover);
    --button-bg-active: color-mix(in srgb, var(--ui-accent-success-hover) 84%, black 16%);
    --button-fg: #ecfdf5;
    --button-fg-hover: #ecfdf5;
    --button-border: var(--ui-accent-success-strong);
    --button-border-hover: var(--ui-accent-success-hover);
  }

  .ui-button[data-variant='warning'] {
    --button-bg: color-mix(in srgb, var(--ui-accent-warning) 20%, var(--ui-surface-card) 80%);
    --button-bg-hover: color-mix(in srgb, var(--ui-accent-warning) 30%, var(--ui-surface-card) 70%);
    --button-bg-active: color-mix(in srgb, var(--ui-accent-warning) 36%, var(--ui-surface-card) 64%);
    --button-fg: color-mix(in srgb, var(--ui-accent-warning) 72%, var(--ui-text-primary) 28%);
    --button-fg-hover: color-mix(in srgb, var(--ui-accent-warning) 82%, var(--ui-text-primary) 18%);
    --button-border: color-mix(in srgb, var(--ui-accent-warning) 28%, var(--ui-border-default) 72%);
    --button-border-hover: color-mix(in srgb, var(--ui-accent-warning) 40%, var(--ui-border-default) 60%);
  }

  .ui-button__spinner {
    animation: ui-button-spin 700ms linear infinite;
  }

  @keyframes ui-button-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
