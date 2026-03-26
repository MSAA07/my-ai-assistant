<script>
  import Card from './Card.svelte';
  import Badge from './Badge.svelte';

  export let title = '';
  export let status = '';
  export let statusLabel = '';
  export let description = '';
  export let className = '';

  const statusToneMap = {
    ready: 'success',
    processing: 'warning',
    generating: 'warning',
    failed: 'destructive',
    info: 'neutral',
  };

  $: statusTone = statusToneMap[status] ?? 'neutral';
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
        tone={statusTone}
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
    gap: var(--study-flow-card-gap);
    min-height: 0;
    justify-content: space-between;
    border-radius: var(--study-flow-card-radius);
    background: var(--study-flow-card-surface);
    box-shadow: none;
  }

  .ui-study-action-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .ui-study-action-card__hero {
    display: grid;
    gap: var(--study-flow-card-gap);
  }

  .ui-study-action-card__icon {
    width: var(--study-flow-icon-box-size);
    height: var(--study-flow-icon-box-size);
    border-radius: var(--study-flow-icon-box-radius);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ui-surface-secondary) 92%, transparent);
    color: var(--ui-text-primary);
  }

  .ui-study-action-card__icon :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
  }

  .ui-study-action-card__copy {
    display: grid;
    gap: var(--ui-space-1);
  }

  .ui-study-action-card__copy h2 {
    margin: 0;
    font-size: 1rem;
    color: var(--ui-text-primary);
    line-height: 1.3;
    letter-spacing: -0.02em;
    font-weight: 500;
  }

  :global(.ui-study-action-card__status) {
    min-height: var(--study-flow-chip-min-height);
    padding-inline: var(--study-flow-chip-padding-inline);
    border-radius: var(--study-flow-chip-radius);
    font-size: 0.75rem;
    letter-spacing: 0;
    text-transform: none;
  }

  :global(.ui-study-action-card__status--ready) {
    border-color: color-mix(in srgb, var(--ui-accent-success) 30%, var(--ui-border-default) 70%);
    background: color-mix(in srgb, var(--ui-accent-success) 10%, transparent);
    color: var(--ui-accent-success);
  }

  :global(.ui-study-action-card__status--processing),
  :global(.ui-study-action-card__status--generating) {
    border-color: color-mix(in srgb, var(--ui-accent-warning) 28%, var(--ui-border-default) 72%);
    background: color-mix(in srgb, var(--ui-accent-warning) 12%, transparent);
    color: color-mix(in srgb, var(--ui-accent-warning) 82%, var(--ui-text-primary) 18%);
  }

  :global(.ui-study-action-card__status--failed) {
    border-color: color-mix(in srgb, var(--ui-accent-danger) 30%, var(--ui-border-default) 70%);
    background: color-mix(in srgb, var(--ui-accent-danger) 10%, transparent);
    color: var(--ui-accent-danger);
  }

  :global(.ui-study-action-card__status--info) {
    border-color: color-mix(in srgb, var(--ui-text-muted) 30%, var(--ui-border-default) 70%);
    background: color-mix(in srgb, var(--ui-surface-secondary) 60%, transparent);
    color: var(--ui-text-secondary);
  }

  .ui-study-action-card__description :global(*),
  .ui-study-action-card__description p {
    margin: 0;
  }

  .ui-study-action-card__description {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    line-height: 1.65;
  }

  .ui-study-action-card__body {
    min-width: 0;
  }

  .ui-study-action-card__actions {
    display: grid;
    gap: var(--study-flow-action-gap);
    margin-top: auto;
  }

  .ui-study-action-card__actions :global(.ui-button) {
    width: 100%;
    min-height: var(--ui-control-height-md);
    font-size: 0.875rem;
    border-radius: var(--ui-radius-sm);
    box-shadow: none;
  }
</style>
