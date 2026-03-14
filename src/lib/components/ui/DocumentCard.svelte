<script>
  import Card from './Card.svelte';
  import Badge from './Badge.svelte';
  import StatusBadge from './StatusBadge.svelte';

  export let title = '';
  export let meta = '';
  export let status = '';
  export let statusLabel = '';
  export let badgeLabel = '';
  export let badgeTone = 'neutral';
  export let highlighted = false;
  export let className = '';
</script>

<Card
  {...$$restProps}
  as="article"
  variant="standard"
  padding="sm"
  hoverable
  border={highlighted ? 'strong' : 'default'}
  className={['ui-document-card', className, $$props.class ?? ''].filter(Boolean).join(' ')}
  on:click
  on:keydown
>
  <div class="ui-document-card__top">
    {#if badgeLabel}
      <Badge tone={badgeTone} variant="outline" size="sm">{badgeLabel}</Badge>
    {/if}

    {#if $$slots.actions}
      <div class="ui-document-card__actions">
        <slot name="actions" />
      </div>
    {/if}
  </div>

  <div class="ui-document-card__content">
    <div class="ui-document-card__copy">
      <h2>{title}</h2>
      {#if meta}
        <p>{meta}</p>
      {/if}
    </div>

    {#if statusLabel}
      <StatusBadge status={status} label={statusLabel} />
    {/if}
  </div>

  {#if $$slots.default}
    <div class="ui-document-card__extra">
      <slot />
    </div>
  {/if}
</Card>

<style>
  :global(.ui-document-card) {
    gap: var(--ui-space-4);
    min-height: 13.5rem;
    cursor: pointer;
  }

  .ui-document-card__top {
    display: flex;
    justify-content: space-between;
    gap: var(--ui-space-3);
    align-items: flex-start;
  }

  .ui-document-card__actions {
    position: relative;
  }

  .ui-document-card__content {
    display: flex;
    justify-content: space-between;
    gap: var(--ui-space-4);
    align-items: flex-end;
    min-width: 0;
    margin-top: auto;
  }

  .ui-document-card__copy {
    display: grid;
    gap: var(--ui-space-2);
    min-width: 0;
  }

  .ui-document-card__copy h2,
  .ui-document-card__copy p {
    margin: 0;
  }

  .ui-document-card__copy h2 {
    font-size: 1rem;
    line-height: 1.35;
    color: var(--ui-text-primary);
    letter-spacing: -0.02em;
    word-break: break-word;
  }

  .ui-document-card__copy p {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
  }

  .ui-document-card__extra {
    min-width: 0;
  }

  @media (max-width: 640px) {
    .ui-document-card__content {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
