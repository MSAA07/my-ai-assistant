<script>
  import { t } from '../../i18n/t.js';

  export let title = t('emptyState.title');
  export let subtitle = t('emptyState.subtitle');
  export let icon = '✨';
</script>

<section class="empty-state" role="status">
  <div class="empty-state__icon" aria-hidden="true">
    <slot name="icon">{icon}</slot>
  </div>
  <h2>{title}</h2>
  <p>{subtitle}</p>
  <div class="empty-state__actions">
    <slot name="actions"></slot>
  </div>
</section>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-3);
    padding: var(--space-6);
    border-radius: var(--radius-2);
    border: 1px dashed var(--color-border);
    background: color-mix(in srgb, var(--color-surface-1) 90%, transparent);
    color: var(--color-text-muted);
  }

  .empty-state__icon {
    inline-size: 64px;
    block-size: 64px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
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
