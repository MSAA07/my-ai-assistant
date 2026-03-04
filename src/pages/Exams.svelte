<script>
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import { t } from '../lib/i18n/t.js';
</script>

<section class="placeholder">
  <StatusBadge status="info">{t('common.comingSoonBadge')}</StatusBadge>
  <h1>{t('examsPage.title')}</h1>
  <p class="lede">{t('examsPage.description')}</p>

  <div class="feature-card">
    <h2>{t('examsPage.features.builder.title')}</h2>
    <p>{t('examsPage.features.builder.description')}</p>
  </div>

  <div class="actions">
    <button type="button" disabled title={t('common.comingSoon')}>
      {t('examsPage.actions.primary')}
    </button>
    <p class="hint">{t('common.comingSoonDetail')}</p>
  </div>
</section>

<style>
  .placeholder {
    max-width: 680px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
    padding: var(--space-6);
    border-radius: var(--radius-3);
    border: 1px solid var(--color-border);
    background: var(--color-surface-1);
  }

  h1 {
    margin: 0;
    font-size: 2.2rem;
    color: var(--color-text-primary);
  }

  .lede {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .feature-card {
    border-radius: var(--radius-2);
    border: 1px dashed var(--color-border);
    padding: var(--space-4);
    background: var(--color-surface-2);
  }

  .feature-card h2 {
    margin: 0 0 0.5rem;
    color: var(--color-text-primary);
  }

  .feature-card p {
    margin: 0;
    color: var(--color-text-secondary);
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

  @media (max-width: 640px) {
    .placeholder {
      padding: var(--space-4);
    }
  }
</style>
