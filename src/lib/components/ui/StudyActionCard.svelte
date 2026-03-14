<script>
  import Card from './Card.svelte';
  import StatusBadge from './StatusBadge.svelte';

  export let title = '';
  export let status = '';
  export let statusLabel = '';
  export let className = '';
</script>

<Card
  {...$$restProps}
  as="article"
  variant="standard"
  padding="md"
  border="default"
  className={['ui-study-action-card', className, $$props.class ?? ''].filter(Boolean).join(' ')}
>
  <div class="ui-study-action-card__header">
    <div class="ui-study-action-card__copy">
      <h2>{title}</h2>
      {#if $$slots.description}
        <div class="ui-study-action-card__description">
          <slot name="description" />
        </div>
      {/if}
    </div>

    {#if statusLabel}
      <StatusBadge status={status} label={statusLabel} />
    {/if}
  </div>

  {#if $$slots.default}
    <div class="ui-study-action-card__body">
      <slot />
    </div>
  {/if}

  {#if $$slots.actions}
    <div class="ui-study-action-card__actions">
      <slot name="actions" />
    </div>
  {/if}
</Card>

<style>
  :global(.ui-study-action-card) {
    gap: var(--ui-space-4);
    min-height: 12rem;
  }

  .ui-study-action-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--ui-space-3);
  }

  .ui-study-action-card__copy {
    display: grid;
    gap: var(--ui-space-1);
  }

  .ui-study-action-card__copy h2 {
    margin: 0;
    font-size: var(--ui-type-title-sm);
    color: var(--ui-text-primary);
  }

  .ui-study-action-card__description :global(*) {
    margin: 0;
  }

  .ui-study-action-card__description {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .ui-study-action-card__body {
    min-width: 0;
  }

  .ui-study-action-card__actions {
    display: flex;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
    margin-top: auto;
  }

  @media (max-width: 640px) {
    .ui-study-action-card__actions :global(.ui-button) {
      width: 100%;
    }
  }
</style>
