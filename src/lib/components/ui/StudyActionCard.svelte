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
    gap: var(--ui-space-4);
    min-height: 23rem;
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
    gap: var(--ui-space-4);
  }

  .ui-study-action-card__icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--ui-radius-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ui-surface-secondary) 72%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 84%, transparent);
    color: var(--ui-text-primary);
  }

  .ui-study-action-card__icon :global(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }

  .ui-study-action-card__copy {
    display: grid;
    gap: var(--ui-space-1);
  }

  .ui-study-action-card__copy h2 {
    margin: 0;
    font-size: clamp(1.2rem, 1.05rem + 0.45vw, 1.55rem);
    color: var(--ui-text-primary);
    line-height: 1.12;
    letter-spacing: -0.03em;
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
    font-size: clamp(0.96rem, 0.93rem + 0.14vw, 1.02rem);
    line-height: 1.58;
  }

  .ui-study-action-card__body {
    min-width: 0;
  }

  .ui-study-action-card__actions {
    display: grid;
    gap: var(--ui-space-2);
    margin-top: auto;
  }

  .ui-study-action-card__actions :global(.ui-button) {
    width: 100%;
    min-height: 3.4rem;
    font-size: 0.98rem;
    border-radius: var(--ui-radius-md);
  }

  @media (max-width: 640px) {
    :global(.ui-study-action-card) {
      min-height: 21.5rem;
    }
  }
</style>
