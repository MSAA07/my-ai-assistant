<script>
  import EmptyState from '../lib/components/ui/EmptyState.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import { t } from '../lib/i18n/t.js';
</script>

<div class="placeholder-wrapper">
  <EmptyState title={t('flashcardsPage.title')} description={t('flashcardsPage.description')}>
    <StatusBadge status="info">{t('common.comingSoonBadge')}</StatusBadge>
    <div class="actions">
      <button type="button" disabled title={t('common.comingSoon')}>
        {t('flashcardsPage.actions.primary')}
      </button>
      <p class="hint">{t('common.comingSoonDetail')}</p>
    </div>
  </EmptyState>
</div>

<style>
  .placeholder-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    align-items: center;
  }

  button {
    min-height: 48px;
    padding: 0 2rem;
    border-radius: 999px;
    border: none;
    background: var(--color-border);
    color: var(--color-text-secondary);
    font-weight: 600;
    cursor: not-allowed;
  }

  .hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }
</style>
