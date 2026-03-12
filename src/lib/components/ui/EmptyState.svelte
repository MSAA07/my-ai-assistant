<script>
  import { t } from '../../i18n/t.js';
  import Card from './Card.svelte';

  export let title = t('emptyState.title');
  export let subtitle = '';
  export let description = '';
  export let icon = '✨';

  $: resolvedDescription = description || subtitle || t('emptyState.subtitle');
</script>

<Card as="section" variant="soft" border="dashed" padding="lg" className="empty-state" role="status">
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
  .empty-state {
    justify-items: center;
    text-align: center;
    color: var(--color-text-muted);
  }

  .empty-state__icon {
    inline-size: 64px;
    block-size: 64px;
    border-radius: var(--ui-radius-lg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    background: var(--ui-surface-raised);
    border: 1px solid var(--ui-border-subtle);
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-text-primary);
  }

  p {
    margin: 0;
    color: var(--color-text-muted);
    max-inline-size: 420px;
  }

  .empty-state__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: center;
  }

  @media (max-width: 640px) {
    .empty-state {
      padding: var(--space-5);
    }
  }
</style>
