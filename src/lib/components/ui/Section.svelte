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
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    background: var(--ui-surface-base);
    box-shadow: none;
    display: grid;
    gap: var(--space-3);
  }

  .ui-section--padded {
    padding: var(--space-4);
  }

  .ui-section__header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--ui-border-subtle);
  }

  .ui-section__heading {
    display: grid;
    gap: 0.2rem;
  }

  .ui-section__heading h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
  }

  .ui-section__heading p {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
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
