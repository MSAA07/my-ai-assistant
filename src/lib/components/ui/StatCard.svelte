<script>
  import Card from './Card.svelte';

  export let label = '';
  export let value = '';
  export let meta = '';
  export let tone = 'neutral';
  export let className = '';
  export let valueClassName = '';

  const toneAliases = {
    danger: 'destructive',
  };

  $: normalizedTone = toneAliases[tone] ?? tone;
  $: resolvedClass = ['ui-stat-card', className, $$props.class ?? ''].filter(Boolean).join(' ');
</script>

<Card
  {...$$restProps}
  className={resolvedClass}
  variant="base"
  padding="md"
  border="subtle"
  data-tone={normalizedTone}
>
  <div class="ui-stat-card__header">
    <p class="ui-stat-card__label">{label}</p>
    {#if $$slots.icon}
      <div class="ui-stat-card__icon">
        <slot name="icon" />
      </div>
    {/if}
  </div>

  <div class="ui-stat-card__body">
    <p class={`ui-stat-card__value ${valueClassName}`.trim()}>{value}</p>
    {#if meta || $$slots.meta}
      <p class="ui-stat-card__meta">
        <slot name="meta">{meta}</slot>
      </p>
    {/if}
  </div>

  {#if $$slots.default}
    <div class="ui-stat-card__content">
      <slot />
    </div>
  {/if}
</Card>

<style>
  :global(.ui-stat-card) {
    gap: 0.5rem;
    min-height: 112px;
  }

  .ui-stat-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .ui-stat-card__label,
  .ui-stat-card__value,
  .ui-stat-card__meta {
    margin: 0;
  }

  .ui-stat-card__label {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .ui-stat-card__body {
    display: grid;
    gap: 0.25rem;
  }

  .ui-stat-card__value {
    color: var(--ui-text-primary);
    font-size: clamp(1.4rem, 2.2vw, 1.65rem);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .ui-stat-card__meta {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-label);
    line-height: 1.3;
  }

  .ui-stat-card__icon {
    display: inline-flex;
    width: 2.5rem;
    height: 2.5rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--ui-surface-secondary) 84%, transparent);
    color: var(--ui-text-muted);
  }

  .ui-stat-card__icon :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
  }

  :global(.ui-stat-card[data-tone='success'] .ui-stat-card__icon) {
    background: color-mix(in srgb, var(--success) 10%, transparent);
    color: color-mix(in srgb, var(--success) 74%, var(--foreground) 26%);
  }

  :global(.ui-stat-card[data-tone='warning'] .ui-stat-card__icon) {
    background: color-mix(in srgb, var(--warning) 10%, transparent);
    color: color-mix(in srgb, var(--warning) 74%, var(--foreground) 26%);
  }

  :global(.ui-stat-card[data-tone='info'] .ui-stat-card__icon) {
    background: color-mix(in srgb, var(--info) 10%, transparent);
    color: color-mix(in srgb, var(--info) 74%, var(--foreground) 26%);
  }

  :global(.ui-stat-card[data-tone='destructive'] .ui-stat-card__icon) {
    background: color-mix(in srgb, var(--destructive) 10%, transparent);
    color: color-mix(in srgb, var(--destructive) 78%, var(--foreground) 22%);
  }

  .ui-stat-card__content {
    min-width: 0;
  }
</style>
