<script>
  import { getLegalHubMeta } from '../lib/legal/content.js';
  import { t } from '../lib/i18n/t.js';
  import { language } from '../lib/stores/language.js';

  $: legalDocs = getLegalHubMeta($language);
  $: isRTL = $language === 'ar';
</script>

<main class="legal-hub">
  <div class="legal-hub__inner">
    <header class="legal-hub__header">
      <p class="legal-hub__eyebrow">{t('publicLegal.eyebrow')}</p>
      <h1 class="legal-hub__title">{t('publicLegal.hub.title')}</h1>
      <p class="legal-hub__subtitle">{t('publicLegal.hub.subtitle')}</p>
    </header>

    <div class="legal-hub__grid">
      {#each legalDocs as doc}
        <a class="legal-card" href="#/legal/{doc.slug}">
          <div class="legal-card__body">
            <h2 class="legal-card__title">{doc.title}</h2>
            <p class="legal-card__desc">{doc.description}</p>
          </div>
          <div class="legal-card__footer">
            <span class="legal-card__date">{t('publicLegal.hub.effective', { date: doc.effectiveDate })}</span>
            <span class="legal-card__arrow" aria-hidden="true">{isRTL ? '←' : '→'}</span>
          </div>
        </a>
      {/each}
    </div>
  </div>
</main>

<style>
  .legal-hub {
    flex: 1;
    padding: 4rem 0 5rem;
  }

  .legal-hub__inner {
    width: min(var(--size-content), calc(100% - 2rem));
    margin: 0 auto;
    display: grid;
    gap: 3rem;
  }

  .legal-hub__header {
    display: grid;
    gap: 0.6rem;
    max-width: 560px;
  }

  .legal-hub__eyebrow {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .legal-hub__title {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .legal-hub__subtitle {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body);
    line-height: 1.6;
  }

  .legal-hub__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .legal-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: var(--ui-radius-lg);
    border: 1px solid var(--ui-border-default);
    background: var(--ui-surface-card);
    color: inherit;
    text-decoration: none;
    transition:
      border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard);
  }

  .legal-card:hover {
    border-color: color-mix(in srgb, var(--ui-border-default) 60%, var(--ui-text-muted) 40%);
    background: color-mix(in srgb, var(--ui-surface-card) 80%, var(--ui-surface-secondary) 20%);
  }

  .legal-card:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .legal-card__body {
    display: grid;
    gap: 0.4rem;
  }

  .legal-card__title {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.3;
  }

  .legal-card__desc {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
  }

  .legal-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .legal-card__date {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
  }

  .legal-card__arrow {
    color: var(--ui-text-muted);
    font-size: 1rem;
    transition: transform var(--motion-fast) var(--ease-standard), color var(--motion-fast) var(--ease-standard);
  }

  .legal-card:hover .legal-card__arrow {
    transform: translateX(3px);
    color: var(--ui-text-secondary);
  }

  :global([dir="rtl"]) .legal-card:hover .legal-card__arrow {
    transform: translateX(-3px);
  }

  @media (max-width: 900px) {
    .legal-hub__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 580px) {
    .legal-hub {
      padding: 2.5rem 0 4rem;
    }

    .legal-hub__inner {
      width: min(100% - 1.5rem, var(--size-content));
      gap: 2rem;
    }

    .legal-hub__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
