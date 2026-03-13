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
    'ui-button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-[color:var(--button-border)] bg-[color:var(--button-bg)] text-[color:var(--button-fg)] shadow-[var(--button-shadow)] outline-none transition-[background-color,border-color,color,box-shadow,opacity] transition-default focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
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
    --button-bg: var(--muted);
    --button-bg-hover: color-mix(in srgb, var(--muted) 78%, var(--foreground) 22%);
    --button-bg-active: color-mix(in srgb, var(--muted) 70%, var(--foreground) 30%);
    --button-fg: var(--foreground);
    --button-fg-hover: var(--foreground);
    --button-border: transparent;
    --button-border-hover: transparent;
    --button-shadow: none;
  }

  .ui-button[data-variant='primary'] {
    --button-bg: var(--primary);
    --button-bg-hover: color-mix(in srgb, var(--primary) 90%, var(--background) 10%);
    --button-bg-active: color-mix(in srgb, var(--primary) 82%, var(--background) 18%);
    --button-fg: var(--primary-foreground);
    --button-fg-hover: var(--primary-foreground);
    --button-border: transparent;
    --button-border-hover: transparent;
  }

  .ui-button[data-variant='secondary'] {
    --button-bg: var(--muted);
    --button-bg-hover: color-mix(in srgb, var(--muted) 82%, var(--foreground) 18%);
    --button-bg-active: color-mix(in srgb, var(--muted) 72%, var(--foreground) 28%);
    --button-fg: var(--foreground);
    --button-fg-hover: var(--foreground);
    --button-border: transparent;
    --button-border-hover: transparent;
  }

  .ui-button[data-variant='outline'] {
    --button-bg: var(--background);
    --button-bg-hover: color-mix(in srgb, var(--accent) 70%, transparent);
    --button-bg-active: color-mix(in srgb, var(--accent) 88%, transparent);
    --button-fg: var(--foreground);
    --button-fg-hover: var(--accent-foreground);
    --button-border: var(--border);
    --button-border-hover: var(--border);
    --button-shadow: var(--shadow-inline-control);
  }

  .ui-button[data-variant='ghost'] {
    --button-bg: transparent;
    --button-bg-hover: color-mix(in srgb, var(--accent) 70%, transparent);
    --button-bg-active: color-mix(in srgb, var(--accent) 88%, transparent);
    --button-fg: var(--muted-foreground);
    --button-fg-hover: var(--accent-foreground);
    --button-border: transparent;
    --button-border-hover: transparent;
  }

  .ui-button[data-variant='destructive'] {
    --button-bg: var(--destructive);
    --button-bg-hover: color-mix(in srgb, var(--destructive) 90%, var(--background) 10%);
    --button-bg-active: color-mix(in srgb, var(--destructive) 82%, var(--background) 18%);
    --button-fg: var(--destructive-foreground);
    --button-fg-hover: var(--destructive-foreground);
    --button-border: transparent;
    --button-border-hover: transparent;
  }

  .ui-button[data-variant='success'] {
    --button-bg: color-mix(in srgb, var(--success) 14%, var(--card) 86%);
    --button-bg-hover: color-mix(in srgb, var(--success) 20%, var(--card) 80%);
    --button-bg-active: color-mix(in srgb, var(--success) 26%, var(--card) 74%);
    --button-fg: color-mix(in srgb, var(--success) 78%, var(--foreground) 22%);
    --button-fg-hover: color-mix(in srgb, var(--success) 84%, var(--foreground) 16%);
    --button-border: color-mix(in srgb, var(--success) 24%, var(--border) 76%);
    --button-border-hover: color-mix(in srgb, var(--success) 32%, var(--border) 68%);
  }

  .ui-button[data-variant='warning'] {
    --button-bg: color-mix(in srgb, var(--warning) 16%, var(--card) 84%);
    --button-bg-hover: color-mix(in srgb, var(--warning) 22%, var(--card) 78%);
    --button-bg-active: color-mix(in srgb, var(--warning) 28%, var(--card) 72%);
    --button-fg: color-mix(in srgb, var(--warning) 78%, var(--foreground) 22%);
    --button-fg-hover: color-mix(in srgb, var(--warning) 84%, var(--foreground) 16%);
    --button-border: color-mix(in srgb, var(--warning) 24%, var(--border) 76%);
    --button-border-hover: color-mix(in srgb, var(--warning) 32%, var(--border) 68%);
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
