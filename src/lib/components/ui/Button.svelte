<script>
  export let type = 'button';
  export let variant = 'secondary';
  export let size = 'md';
  export let block = false;
  export let loading = false;
  export let disabled = false;
  export let className = '';

  $: isDisabled = disabled || loading;
  $: resolvedClass = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    block ? 'ui-button--block' : '',
    loading ? 'ui-button--loading' : '',
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
  disabled={isDisabled}
  aria-busy={loading}
  on:click
>
  {#if $$slots.icon}
    <span class="ui-button__icon"><slot name="icon" /></span>
  {/if}
  <span class="ui-button__label"><slot /></span>
  {#if loading}
    <span class="ui-button__spinner" aria-hidden="true"></span>
  {/if}
</button>

<style>
  .ui-button {
    --ui-button-bg: var(--ui-surface-raised);
    --ui-button-bg-hover: var(--color-surface-3);
    --ui-button-bg-active: var(--color-surface-3);
    --ui-button-color: var(--color-text-primary);
    --ui-button-border: var(--ui-border-subtle);
    --ui-button-border-hover: var(--ui-border-strong);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: var(--ui-control-height-md);
    padding: 0 0.78rem;
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--ui-button-border);
    background: var(--ui-button-bg);
    color: var(--ui-button-color);
    font-size: var(--font-size-sm);
    font-weight: 600;
    line-height: 1.1;
    cursor: pointer;
    text-decoration: none;
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  .ui-button:hover:not(:disabled) {
    background: var(--ui-button-bg-hover);
    border-color: var(--ui-button-border-hover);
  }

  .ui-button:active:not(:disabled) {
    background: var(--ui-button-bg-active);
    border-color: var(--ui-button-border-hover);
  }

  .ui-button:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .ui-button:disabled {
    cursor: not-allowed;
    opacity: 0.46;
    box-shadow: none;
  }

  .ui-button--loading {
    pointer-events: none;
  }

  .ui-button--primary {
    --ui-button-bg: var(--color-text-primary);
    --ui-button-bg-hover: #ffffff;
    --ui-button-bg-active: #e9e9ee;
    --ui-button-color: var(--color-text-on-dark);
    --ui-button-border: rgba(255, 255, 255, 0.18);
    --ui-button-border-hover: rgba(255, 255, 255, 0.28);
  }

  .ui-button--secondary {
    --ui-button-bg: var(--ui-surface-raised);
    --ui-button-bg-hover: var(--color-surface-3);
    --ui-button-bg-active: var(--color-surface-3);
    --ui-button-color: var(--color-text-primary);
    --ui-button-border: var(--ui-border-subtle);
    --ui-button-border-hover: var(--ui-border-strong);
  }

  .ui-button--ghost {
    --ui-button-bg: transparent;
    --ui-button-bg-hover: rgba(255, 255, 255, 0.04);
    --ui-button-bg-active: rgba(255, 255, 255, 0.06);
    --ui-button-color: var(--color-text-secondary);
    --ui-button-border: var(--ui-border-subtle);
    --ui-button-border-hover: var(--ui-border-strong);
  }

  .ui-button--danger {
    --ui-button-bg: color-mix(in srgb, var(--color-danger) 12%, var(--ui-surface-raised) 88%);
    --ui-button-bg-hover: color-mix(in srgb, var(--color-danger) 18%, var(--ui-surface-raised) 82%);
    --ui-button-bg-active: color-mix(in srgb, var(--color-danger) 24%, var(--ui-surface-raised) 76%);
    --ui-button-color: color-mix(in srgb, var(--color-danger) 70%, var(--color-text-primary) 30%);
    --ui-button-border: color-mix(in srgb, var(--color-danger) 38%, var(--ui-border-subtle) 62%);
    --ui-button-border-hover: color-mix(in srgb, var(--color-danger) 48%, var(--ui-border-subtle) 52%);
  }

  .ui-button--success {
    --ui-button-bg: color-mix(in srgb, var(--color-success) 12%, var(--ui-surface-raised) 88%);
    --ui-button-bg-hover: color-mix(in srgb, var(--color-success) 18%, var(--ui-surface-raised) 82%);
    --ui-button-bg-active: color-mix(in srgb, var(--color-success) 24%, var(--ui-surface-raised) 76%);
    --ui-button-color: color-mix(in srgb, var(--color-success) 70%, var(--color-text-primary) 30%);
    --ui-button-border: color-mix(in srgb, var(--color-success) 34%, var(--ui-border-subtle) 66%);
    --ui-button-border-hover: color-mix(in srgb, var(--color-success) 44%, var(--ui-border-subtle) 56%);
  }

  .ui-button--warning {
    --ui-button-bg: color-mix(in srgb, var(--color-warning) 12%, var(--ui-surface-raised) 88%);
    --ui-button-bg-hover: color-mix(in srgb, var(--color-warning) 20%, var(--ui-surface-raised) 80%);
    --ui-button-bg-active: color-mix(in srgb, var(--color-warning) 26%, var(--ui-surface-raised) 74%);
    --ui-button-color: color-mix(in srgb, var(--color-warning) 74%, var(--color-text-primary) 26%);
    --ui-button-border: color-mix(in srgb, var(--color-warning) 34%, var(--ui-border-subtle) 66%);
    --ui-button-border-hover: color-mix(in srgb, var(--color-warning) 46%, var(--ui-border-subtle) 54%);
  }

  .ui-button--sm {
    min-height: var(--ui-control-height-sm);
    padding-inline: 0.65rem;
    border-radius: var(--ui-radius-sm);
    font-size: 0.73rem;
  }

  .ui-button--md {
    min-height: var(--ui-control-height-md);
  }

  .ui-button--lg {
    min-height: var(--ui-control-height-lg);
    padding-inline: 1rem;
    font-size: var(--font-size-md);
  }

  .ui-button--icon {
    min-width: var(--ui-control-height-md);
    width: var(--ui-control-height-md);
    padding: 0;
    border-radius: var(--ui-radius-sm);
  }

  .ui-button--block {
    width: 100%;
  }

  .ui-button__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .ui-button__icon :global(svg) {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .ui-button__label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ui-button__spinner {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, currentColor 35%, transparent);
    border-top-color: currentColor;
    animation: ui-button-spin 700ms linear infinite;
  }

  @keyframes ui-button-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
