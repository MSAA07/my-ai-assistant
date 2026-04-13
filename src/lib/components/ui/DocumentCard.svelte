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

  $: normalizedFileType = typeof badgeLabel === 'string' ? badgeLabel.trim().toUpperCase() : '';
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
      <Badge tone={badgeTone} variant="outline" size="sm" className="ui-document-card__type-badge">
        <span class="ui-document-card__type-icon" aria-hidden="true">
          {#if normalizedFileType === 'PDF'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 3.75h5.5L18 8.25V19a1.75 1.75 0 0 1-1.75 1.75h-8.5A1.75 1.75 0 0 1 6 19V5.5A1.75 1.75 0 0 1 7.75 3.75Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 3.75V8.5h4.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {:else if normalizedFileType === 'DOCX'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 3.75h5.5L18 8.25V19a1.75 1.75 0 0 1-1.75 1.75h-8.5A1.75 1.75 0 0 1 6 19V5.5A1.75 1.75 0 0 1 7.75 3.75Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 3.75V8.5h4.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9.5 13.25 11 15.5l1.5-2.25L14 15.5l1.5-2.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 3.75h5.5L18 8.25V19a1.75 1.75 0 0 1-1.75 1.75h-8.5A1.75 1.75 0 0 1 6 19V5.5A1.75 1.75 0 0 1 7.75 3.75Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 3.75V8.5h4.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {/if}
        </span>
        {badgeLabel}
      </Badge>
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
    gap: var(--study-flow-card-gap);
    min-height: 11.25rem;
    cursor: pointer;
    border-radius: var(--study-flow-card-radius);
    background: var(--study-flow-card-surface);
    box-shadow: none;
  }

  :global(.ui-document-card[data-hoverable='true']) {
    --card-hover-border: color-mix(in srgb, var(--ui-text-primary) 12%, var(--ui-border-default) 88%);
    --card-hover-bg: color-mix(in srgb, var(--study-flow-card-surface) 92%, var(--ui-surface-secondary) 8%);
    --card-hover-shadow: none;
  }

  .ui-document-card__top {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .ui-document-card__actions {
    position: relative;
  }

  .ui-document-card__content {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: flex-start;
    min-width: 0;
    margin-top: auto;
  }

  .ui-document-card__copy {
    display: grid;
    gap: 0.5rem;
    min-width: 0;
    flex: 1;
  }

  .ui-document-card__copy h2,
  .ui-document-card__copy p {
    margin: 0;
  }

  .ui-document-card__copy h2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    font-size: 0.9375rem;
    line-height: 1.45;
    color: var(--ui-text-primary);
    letter-spacing: -0.02em;
    word-break: break-word;
    font-weight: 500;
  }

  .ui-document-card__copy p {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
  }

  :global(.ui-document-card__type-badge) {
    gap: 0.35rem;
    letter-spacing: 0;
    min-height: 1.5rem;
    padding-inline: 0.5rem;
    border-radius: 0.375rem;
  }

  :global(.ui-document-card .status-badge) {
    min-height: 1.375rem;
    padding-inline: 0.45rem;
    border-radius: 0.375rem;
    font-size: 0.625rem;
    color: var(--ui-text-muted);
  }

  :global(.ui-document-card .status-badge[data-tone='success']) {
    background: color-mix(in srgb, var(--ui-accent-success) 8%, transparent);
    border-color: color-mix(in srgb, var(--ui-accent-success) 16%, var(--ui-border-default) 84%);
    color: color-mix(in srgb, var(--ui-accent-success) 72%, var(--ui-text-primary) 28%);
  }

  :global(.ui-document-card .status-badge[data-tone='info']) {
    background: color-mix(in srgb, var(--ui-accent-warning) 8%, transparent);
    border-color: color-mix(in srgb, var(--ui-accent-warning) 18%, var(--ui-border-default) 82%);
    color: color-mix(in srgb, var(--ui-accent-warning) 76%, var(--ui-text-primary) 24%);
  }

  :global(.ui-document-card .status-badge[data-tone='destructive']) {
    background: color-mix(in srgb, var(--ui-accent-danger) 8%, transparent);
    border-color: color-mix(in srgb, var(--ui-accent-danger) 18%, var(--ui-border-default) 82%);
    color: color-mix(in srgb, var(--ui-accent-danger) 76%, var(--ui-text-primary) 24%);
  }

  .ui-document-card__type-icon {
    display: inline-flex;
    width: 0.875rem;
    height: 0.875rem;
    align-items: center;
    justify-content: center;
  }

  .ui-document-card__type-icon svg {
    width: 0.875rem;
    height: 0.875rem;
    stroke: currentColor;
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
