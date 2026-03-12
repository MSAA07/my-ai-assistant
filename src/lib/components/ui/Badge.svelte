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
    --badge-bg: color-mix(in srgb, var(--color-border) 14%, transparent);
    --badge-border: color-mix(in srgb, var(--color-border) 36%, transparent);
    --badge-text: var(--color-text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    border-radius: var(--ui-radius-pill);
    border: 1px solid var(--badge-border);
    background: var(--badge-bg);
    color: var(--badge-text);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
  }

  .ui-badge[data-size='xs'] {
    min-height: 20px;
    padding: 0.08rem 0.44rem;
    font-size: 0.67rem;
    letter-spacing: 0.04em;
  }

  .ui-badge[data-size='sm'] {
    min-height: 24px;
    padding: 0.16rem 0.55rem;
    font-size: 0.75rem;
    letter-spacing: 0.03em;
  }

  .ui-badge[data-size='md'] {
    min-height: 28px;
    padding: 0.2rem 0.65rem;
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
    --badge-bg: color-mix(in srgb, var(--color-border) 14%, transparent);
    --badge-border: color-mix(in srgb, var(--color-border) 34%, transparent);
    --badge-text: var(--color-text-secondary);
  }

  .ui-badge[data-tone='accent'] {
    --badge-bg: color-mix(in srgb, var(--color-accent-primary) 14%, transparent);
    --badge-border: color-mix(in srgb, var(--color-accent-primary) 30%, transparent);
    --badge-text: color-mix(in srgb, var(--color-accent-primary) 80%, var(--color-text-soft) 20%);
  }

  .ui-badge[data-tone='info'] {
    --badge-bg: color-mix(in srgb, var(--color-info) 14%, transparent);
    --badge-border: color-mix(in srgb, var(--color-info) 30%, transparent);
    --badge-text: color-mix(in srgb, var(--color-info) 80%, var(--color-text-soft) 20%);
  }

  .ui-badge[data-tone='success'] {
    --badge-bg: color-mix(in srgb, var(--color-success) 14%, transparent);
    --badge-border: color-mix(in srgb, var(--color-success) 30%, transparent);
    --badge-text: color-mix(in srgb, var(--color-success) 78%, var(--color-text-soft) 22%);
  }

  .ui-badge[data-tone='warning'] {
    --badge-bg: color-mix(in srgb, var(--color-warning) 18%, transparent);
    --badge-border: color-mix(in srgb, var(--color-warning) 36%, transparent);
    --badge-text: color-mix(in srgb, var(--color-warning) 82%, var(--color-text-soft) 18%);
  }

  .ui-badge[data-tone='danger'] {
    --badge-bg: color-mix(in srgb, var(--color-danger) 14%, transparent);
    --badge-border: color-mix(in srgb, var(--color-danger) 30%, transparent);
    --badge-text: color-mix(in srgb, var(--color-danger) 82%, var(--color-text-soft) 18%);
  }
</style>
