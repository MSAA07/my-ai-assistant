<script>
  export let as = 'section';
  export let title = '';
  export let description = '';
  export let padded = true;
  export let className = '';

  $: hasHeader = Boolean(title || description || $$slots.header || $$slots.actions);
  $: resolvedClass = [
    'ui-section',
    padded ? 'ui-section--padded' : '',
    className,
    $$props.class ?? ''
  ]
    .filter(Boolean)
    .join(' ');
</script>

<svelte:element {...$$restProps} this={as} class={resolvedClass}>
  {#if hasHeader}
    <header class="ui-section__header">
      <div class="ui-section__heading">
        {#if $$slots.header}
          <slot name="header" />
        {:else}
          {#if title}
            <h2>{title}</h2>
          {/if}
          {#if description}
            <p>{description}</p>
          {/if}
        {/if}
      </div>
      {#if $$slots.actions}
        <div class="ui-section__actions">
          <slot name="actions" />
        </div>
      {/if}
    </header>
  {/if}

  <div class="ui-section__body">
    <slot />
  </div>
</svelte:element>

<style>
  .ui-section {
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-lg);
    background: color-mix(in srgb, var(--ui-surface-card) 96%, transparent);
    box-shadow: var(--ui-shadow-1);
    display: grid;
    gap: var(--ui-space-3);
    min-width: 0;
  }

  .ui-section--padded {
    padding: var(--ui-space-4);
  }

  .ui-section__header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-3);
    padding-bottom: var(--ui-space-3);
    border-bottom: 1px solid var(--ui-divider);
  }

  .ui-section__heading {
    display: grid;
    gap: var(--ui-space-1);
  }

  .ui-section__heading h2 {
    margin: 0;
    font-size: var(--ui-type-title-sm);
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--ui-text-primary);
  }

  .ui-section__heading p {
    margin: 0;
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
    color: var(--ui-text-secondary);
  }

  .ui-section__actions {
    display: inline-flex;
    gap: var(--space-2);
    align-items: center;
  }

  .ui-section__body {
    min-width: 0;
  }
</style>
