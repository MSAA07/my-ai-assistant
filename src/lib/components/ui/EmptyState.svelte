<script>
  import { t } from '../../i18n/t.js';
  import Card from './Card.svelte';

  export let title = t('emptyState.title');
  export let subtitle = '';
  export let description = '';
  export let icon = '✨';

  $: resolvedDescription = description || subtitle || t('emptyState.subtitle');
</script>

<Card as="section" variant="base" border="dashed" padding="lg" className="empty-state" role="status">
  <div class="empty-state__icon" aria-hidden="true">
    <slot name="icon">{icon}</slot>
  </div>
  <h2>{title}</h2>
  <p>{resolvedDescription}</p>
  <div class="empty-state__actions">
    <slot name="actions"></slot>
    <slot></slot>
  </div>
</Card>

<style>
  :global(.empty-state) {
    gap: 0.85rem;
    justify-items: center;
    text-align: center;
    color: var(--muted-foreground);
    min-width: 0;
  }

  .empty-state__icon {
    inline-size: 48px;
    block-size: 48px;
    border-radius: calc(var(--radius) + 2px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    background: color-mix(in srgb, var(--muted) 76%, transparent);
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    box-shadow: var(--shadow-inline-control);
  }

  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--muted-foreground);
    line-height: 1.6;
    max-inline-size: 420px;
  }

  .empty-state__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: center;
  }

  @media (max-width: 640px) {
    :global(.empty-state) {
      padding: var(--space-5);
    }
  }
</style>
