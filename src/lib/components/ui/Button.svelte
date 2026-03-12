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
    --ui-button-bg-hover: color-mix(in srgb, var(--ui-surface-raised) 90%, white 10%);
    --ui-button-color: var(--color-text-primary);
    --ui-button-border: var(--ui-border-subtle);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: var(--ui-control-height-md);
    padding: 0 1rem;
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--ui-button-border);
    background: var(--ui-button-bg);
    color: var(--ui-button-color);
    font-size: var(--font-size-sm);
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    text-decoration: none;
    transition: transform var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  .ui-button:hover:not(:disabled) {
    background: var(--ui-button-bg-hover);
    border-color: var(--ui-border-strong);
    transform: translateY(-1px);
  }

  .ui-button:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .ui-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
  }

  .ui-button--primary {
    --ui-button-bg: var(--gradient-accent-strong);
    --ui-button-bg-hover: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-accent-primary) 85%, white 15%) 0%,
      color-mix(in srgb, var(--color-accent-secondary) 85%, white 15%) 100%
    );
    --ui-button-color: var(--color-text-on-dark);
    --ui-button-border: color-mix(in srgb, var(--color-accent-primary) 55%, transparent);
    box-shadow: 0 10px 26px color-mix(in srgb, var(--color-accent-primary) 30%, transparent);
  }

  .ui-button--secondary {
    --ui-button-bg: color-mix(in srgb, var(--ui-surface-raised) 90%, transparent);
    --ui-button-bg-hover: color-mix(in srgb, var(--ui-surface-raised) 82%, white 18%);
    --ui-button-color: var(--color-text-primary);
    --ui-button-border: var(--ui-border-subtle);
  }

  .ui-button--ghost {
    --ui-button-bg: transparent;
    --ui-button-bg-hover: color-mix(in srgb, var(--color-accent-primary) 14%, transparent);
    --ui-button-color: var(--color-text-secondary);
    --ui-button-border: color-mix(in srgb, var(--color-border) 70%, transparent);
  }

  .ui-button--danger {
    --ui-button-bg: color-mix(in srgb, var(--color-danger) 88%, black 12%);
    --ui-button-bg-hover: color-mix(in srgb, var(--color-danger) 80%, black 20%);
    --ui-button-color: var(--color-text-on-dark);
    --ui-button-border: color-mix(in srgb, var(--color-danger) 45%, transparent);
  }

  .ui-button--success {
    --ui-button-bg: color-mix(in srgb, var(--color-success) 88%, black 12%);
    --ui-button-bg-hover: color-mix(in srgb, var(--color-success) 80%, black 20%);
    --ui-button-color: var(--color-text-on-dark);
    --ui-button-border: color-mix(in srgb, var(--color-success) 45%, transparent);
  }

  .ui-button--sm {
    min-height: var(--ui-control-height-sm);
    padding-inline: 0.8rem;
    border-radius: var(--ui-radius-sm);
    font-size: var(--font-size-xs);
  }

  .ui-button--md {
    min-height: var(--ui-control-height-md);
  }

  .ui-button--lg {
    min-height: var(--ui-control-height-lg);
    padding-inline: 1.15rem;
    font-size: var(--font-size-md);
  }

  .ui-button--icon {
    min-width: var(--ui-control-height-md);
    width: var(--ui-control-height-md);
    padding: 0;
    border-radius: var(--ui-radius-pill);
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
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .ui-button__label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ui-button__spinner {
    width: 14px;
    height: 14px;
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
