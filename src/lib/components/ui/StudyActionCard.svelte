<script>
  import Card from './Card.svelte';
  import Badge from './Badge.svelte';

  export let title = '';
  export let status = '';
  export let statusLabel = '';
  export let description = '';
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
    <div class="ui-study-action-card__hero">
      {#if $$slots.icon}
        <div class="ui-study-action-card__icon" aria-hidden="true">
          <slot name="icon" />
        </div>
      {/if}

      <div class="ui-study-action-card__copy">
        <h2>{title}</h2>
      </div>
    </div>

    {#if statusLabel}
      <Badge
        tone={status === 'ready' ? 'success' : 'neutral'}
        variant="outline"
        size="sm"
        className={`ui-study-action-card__status ui-study-action-card__status--${status || 'neutral'}`}
      >
        {statusLabel}
      </Badge>
    {/if}
  </div>

  {#if description || $$slots.description}
    <div class="ui-study-action-card__description">
      {#if $$slots.description}
        <slot name="description" />
      {:else}
        <p>{description}</p>
      {/if}
    </div>
  {/if}

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
    gap: var(--ui-space-5);
    min-height: 27rem;
    justify-content: space-between;
    border-radius: var(--ui-radius-lg);
    background: color-mix(in srgb, var(--ui-surface-card) 98%, transparent);
  }

  .ui-study-action-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--ui-space-3);
  }

  .ui-study-action-card__hero {
    display: grid;
    gap: var(--ui-space-6);
  }

  .ui-study-action-card__icon {
    width: 4.25rem;
    height: 4.25rem;
    border-radius: var(--ui-radius-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ui-surface-secondary) 64%, transparent);
    color: var(--ui-text-primary);
  }

  .ui-study-action-card__icon :global(svg) {
    width: 1.75rem;
    height: 1.75rem;
    stroke-width: 2.1;
  }

  .ui-study-action-card__copy {
    display: grid;
    gap: var(--ui-space-1);
  }

  .ui-study-action-card__copy h2 {
    margin: 0;
    font-size: clamp(1.45rem, 1.18rem + 0.7vw, 1.9rem);
    color: var(--ui-text-primary);
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  :global(.ui-study-action-card__status) {
    min-height: 2.125rem;
    padding-inline: 0.9rem;
    border-radius: var(--ui-radius-pill);
    font-size: 0.78rem;
    letter-spacing: 0;
  }

  :global(.ui-study-action-card__status--ready) {
    border-color: color-mix(in srgb, var(--ui-accent-success) 42%, var(--ui-border-default) 58%);
    background: color-mix(in srgb, var(--ui-accent-success) 12%, transparent);
    color: var(--ui-accent-success);
  }

  :global(.ui-study-action-card__status--info),
  :global(.ui-study-action-card__status--processing) {
    border-color: var(--ui-border-default);
    background: color-mix(in srgb, var(--ui-surface-secondary) 50%, transparent);
    color: var(--ui-text-secondary);
  }

  .ui-study-action-card__description :global(*),
  .ui-study-action-card__description p {
    margin: 0;
  }

  .ui-study-action-card__description {
    color: var(--ui-text-muted);
    font-size: clamp(1rem, 0.95rem + 0.18vw, 1.08rem);
    line-height: 1.65;
  }

  .ui-study-action-card__body {
    min-width: 0;
  }

  .ui-study-action-card__actions {
    display: grid;
    gap: var(--ui-space-3);
    margin-top: auto;
  }

  .ui-study-action-card__actions :global(.ui-button) {
    width: 100%;
    min-height: 3.8rem;
    font-size: 1rem;
    border-radius: var(--ui-radius-md);
  }

  @media (max-width: 640px) {
    :global(.ui-study-action-card) {
      min-height: 24rem;
    }
  }
</style>
