<script>
  export let tone = 'neutral';
  export let variant = 'soft';
  export let size = 'sm';
  export let uppercase = false;
  export let className = '';

  $: resolvedClass = ['ui-badge', className, $$props.class ?? ''].filter(Boolean).join(' ');
</script>

<span
  {...$$restProps}
  class={resolvedClass}
  data-tone={tone}
  data-variant={variant}
  data-size={size}
  data-uppercase={uppercase}
>
  <slot />
</span>

<style>
  .ui-badge {
    --badge-bg: rgba(255, 255, 255, 0.04);
    --badge-border: rgba(255, 255, 255, 0.08);
    --badge-text: var(--color-text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    border-radius: var(--ui-radius-pill);
    border: 1px solid var(--badge-border);
    background: var(--badge-bg);
    color: var(--badge-text);
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }

  .ui-badge[data-size='xs'] {
    min-height: 18px;
    padding: 0.06rem 0.4rem;
    font-size: 0.64rem;
    letter-spacing: 0.04em;
  }

  .ui-badge[data-size='sm'] {
    min-height: 22px;
    padding: 0.12rem 0.52rem;
    font-size: 0.72rem;
    letter-spacing: 0.03em;
  }

  .ui-badge[data-size='md'] {
    min-height: 26px;
    padding: 0.16rem 0.62rem;
    font-size: var(--font-size-sm);
  }

  .ui-badge[data-uppercase='true'] {
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .ui-badge[data-variant='outline'] {
    --badge-bg: transparent;
  }

  .ui-badge[data-variant='solid'] {
    --badge-bg: var(--badge-text);
    --badge-border: transparent;
    color: var(--color-text-on-dark);
  }

  .ui-badge[data-tone='neutral'] {
    --badge-bg: rgba(255, 255, 255, 0.04);
    --badge-border: rgba(255, 255, 255, 0.08);
    --badge-text: var(--color-text-secondary);
  }

  .ui-badge[data-tone='accent'] {
    --badge-bg: rgba(255, 255, 255, 0.06);
    --badge-border: rgba(255, 255, 255, 0.12);
    --badge-text: var(--color-text-primary);
  }

  .ui-badge[data-tone='info'] {
    --badge-bg: color-mix(in srgb, var(--color-info) 12%, var(--ui-surface-base) 88%);
    --badge-border: color-mix(in srgb, var(--color-info) 30%, var(--color-border) 70%);
    --badge-text: color-mix(in srgb, var(--color-info) 66%, var(--color-text-primary) 34%);
  }

  .ui-badge[data-tone='success'] {
    --badge-bg: color-mix(in srgb, var(--color-success) 12%, var(--ui-surface-base) 88%);
    --badge-border: color-mix(in srgb, var(--color-success) 28%, var(--color-border) 72%);
    --badge-text: color-mix(in srgb, var(--color-success) 68%, var(--color-text-primary) 32%);
  }

  .ui-badge[data-tone='warning'] {
    --badge-bg: color-mix(in srgb, var(--color-warning) 14%, var(--ui-surface-base) 86%);
    --badge-border: color-mix(in srgb, var(--color-warning) 32%, var(--color-border) 68%);
    --badge-text: color-mix(in srgb, var(--color-warning) 72%, var(--color-text-primary) 28%);
  }

  .ui-badge[data-tone='danger'] {
    --badge-bg: color-mix(in srgb, var(--color-danger) 12%, var(--ui-surface-base) 88%);
    --badge-border: color-mix(in srgb, var(--color-danger) 30%, var(--color-border) 70%);
    --badge-text: color-mix(in srgb, var(--color-danger) 68%, var(--color-text-primary) 32%);
  }
</style>
