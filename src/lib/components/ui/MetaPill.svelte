<script>
  export let label = '';
  export let value = '';
  export let className = '';
</script>

<div
  {...$$restProps}
  class={['ui-meta-pill', className, $$props.class ?? ''].filter(Boolean).join(' ')}
>
  {#if $$slots.label}
    <slot name="label" />
  {:else if label}
    <span class="ui-meta-pill__label">{label}</span>
  {/if}

  {#if $$slots.default}
    <slot />
  {:else if value}
    <strong class="ui-meta-pill__value">{value}</strong>
  {/if}
</div>

<style>
  .ui-meta-pill {
    display: grid;
    gap: 0.45rem;
    min-width: 0;
    padding: var(--ui-space-3) var(--ui-space-4);
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--ui-border-default);
    background: color-mix(in srgb, var(--ui-surface-card) 82%, var(--ui-surface-secondary) 18%);
    box-shadow: var(--ui-shadow-1);
  }

  .ui-meta-pill__label {
    color: var(--ui-text-muted);
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
  }

  .ui-meta-pill__value {
    color: var(--ui-text-primary);
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
    overflow-wrap: anywhere;
  }
</style>
