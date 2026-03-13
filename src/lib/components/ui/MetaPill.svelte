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
    padding: 0.9rem 1rem;
    border-radius: 0.9rem;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    background: color-mix(in srgb, var(--card) 76%, var(--muted) 24%);
    box-shadow: var(--shadow-inline-control);
  }

  .ui-meta-pill__label {
    color: var(--muted-foreground);
    font-size: var(--font-size-xs);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .ui-meta-pill__value {
    color: var(--foreground);
    font-size: var(--font-size-sm);
    font-weight: 600;
    overflow-wrap: anywhere;
  }
</style>
