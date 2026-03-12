<script>
  import Card from './Card.svelte';

  export let title = '';
  export let description = '';
  export let className = '';
  export let variant = 'base';
  export let border = 'subtle';
  export let padding = 'md';
  export let compact = false;
  export let tableMinWidth = '720px';

  $: hasHeader = Boolean(title || description || $$slots.header || $$slots.actions);
  $: resolvedClass = [
    'ui-data-surface',
    compact ? 'ui-data-surface--compact' : '',
    className,
    $$props.class ?? ''
  ]
    .filter(Boolean)
    .join(' ');
  $: tableVars = `--ui-data-surface-table-min-width: ${tableMinWidth};`;
</script>

<Card {...$$restProps} {variant} {border} {padding} className={resolvedClass}>
  {#if hasHeader}
    <header class="ui-data-surface__header">
      <div class="ui-data-surface__heading">
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
        <div class="ui-data-surface__actions">
          <slot name="actions" />
        </div>
      {/if}
    </header>
  {/if}

  {#if $$slots.filters}
    <div class="ui-data-surface__filters">
      <slot name="filters" />
    </div>
  {/if}

  {#if $$slots.panels}
    <div class="ui-data-surface__panels">
      <slot name="panels" />
    </div>
  {/if}

  {#if $$slots.bulk}
    <div class="ui-data-surface__bulk">
      <slot name="bulk" />
    </div>
  {/if}

  {#if $$slots.state}
    <div class="ui-data-surface__state">
      <slot name="state" />
    </div>
  {/if}

  {#if $$slots.table}
    <div class="ui-data-surface__table-wrap" style={tableVars}>
      <slot name="table" />
    </div>
  {/if}

  {#if $$slots.default}
    <div class="ui-data-surface__content">
      <slot />
    </div>
  {/if}
</Card>

<style>
  :global(.ui-data-surface) {
    min-width: 0;
    gap: var(--space-3);
  }

  :global(.ui-data-surface--compact) {
    gap: var(--space-3);
  }

  .ui-data-surface__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--ui-border-subtle);
  }

  .ui-data-surface__heading {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
  }

  .ui-data-surface__heading h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .ui-data-surface__heading p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }

  .ui-data-surface__actions {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .ui-data-surface__filters {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .ui-data-surface__bulk {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .ui-data-surface__panels {
    display: grid;
    gap: var(--space-3);
    min-width: 0;
  }

  .ui-data-surface__state {
    display: grid;
    gap: var(--space-2);
  }

  .ui-data-surface__state :global(.ui-data-state-note) {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .ui-data-surface__state :global(.ui-data-state-error) {
    color: var(--color-danger-soft);
    border-color: color-mix(in srgb, var(--color-danger) 34%, var(--color-border) 66%);
  }

  .ui-data-surface__table-wrap {
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
  }

  .ui-data-surface__table-wrap :global(.ui-data-table) {
    width: 100%;
    min-width: var(--ui-data-surface-table-min-width, 720px);
    border-collapse: collapse;
  }

  .ui-data-surface__table-wrap :global(.ui-data-table th),
  .ui-data-surface__table-wrap :global(.ui-data-table td) {
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid var(--ui-border-subtle);
    text-align: start;
    vertical-align: top;
  }

  .ui-data-surface__table-wrap :global(.ui-data-table th) {
    font-size: 0.67rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .ui-data-surface__table-wrap :global(.ui-data-table tbody tr:last-child td) {
    border-bottom: 0;
  }

  .ui-data-surface__content {
    min-width: 0;
  }

  .ui-data-surface__panels:empty,
  .ui-data-surface__bulk:empty,
  .ui-data-surface__state:empty,
  .ui-data-surface__table-wrap:empty {
    display: none;
  }

  @media (max-width: 640px) {
    .ui-data-surface__filters {
      grid-template-columns: 1fr;
    }
  }
</style>
