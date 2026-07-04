<script>
  import { getLegalPageMap, getLegalPages } from '../lib/legal/content.js';
  import { t } from '../lib/i18n/t.js';
  import { language } from '../lib/stores/language.js';

  export let slug = '';

  let activeSectionId = '';

  $: pageMap = getLegalPageMap($language);
  $: legalDocs = getLegalPages($language);
  $: page = pageMap[slug] ?? null;
  $: isRTL = $language === 'ar';
  $: backArrow = isRTL ? '→' : '←';

  function sectionId(index) {
    return `legal-section-${index + 1}`;
  }

  function scrollToSection(id) {
    activeSectionId = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleDocumentClick() {
    activeSectionId = '';
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }
</script>

{#if page}
  <main class="legal-doc-page">
    <div class="legal-doc-page__inner">
      <div class="legal-doc-layout">
        <aside class="legal-outline" aria-label={t('publicLegal.outline.ariaLabel')}>
          <div class="legal-outline__group">
            <p class="legal-outline__label">{t('publicLegal.documents.title')}</p>
            <nav class="legal-outline__nav" aria-label={t('publicLegal.documents.ariaLabel')}>
              {#each legalDocs as doc}
                <a
                  href="#/legal/{doc.slug}"
                  class:active={doc.slug === page.slug}
                  on:click={handleDocumentClick}
                >
                  {doc.title}
                </a>
              {/each}
            </nav>
          </div>

          <div class="legal-outline__group">
            <p class="legal-outline__label">{t('publicLegal.outline.title')}</p>
            <nav class="legal-outline__nav" aria-label={t('publicLegal.outline.ariaLabel')}>
              {#each page.sections as section, index}
                {@const id = sectionId(index)}
                <button
                  type="button"
                  class:active={activeSectionId === id}
                  on:click={() => scrollToSection(id)}
                >
                  {section.heading}
                </button>
              {/each}
            </nav>
          </div>
        </aside>

        <div class="legal-doc-content">
          <nav class="legal-doc-page__breadcrumb" aria-label={t('publicLegal.breadcrumbLabel')}>
            <a href="#/" class="legal-back">{backArrow} {t('publicLegal.backToLanding')}</a>
          </nav>

          <header class="legal-doc-page__header">
            <h1 class="legal-doc-page__title">{page.title}</h1>
            <div class="legal-doc-page__meta">
              <span>{t('publicLegal.meta.effectiveDate')}: {page.effectiveDate}</span>
              {#if page.appliesTo}
                <span class="legal-meta-sep" aria-hidden="true">·</span>
                <span>{t('publicLegal.meta.appliesTo')}: {page.appliesTo}</span>
              {/if}
              {#if page.governingLaw}
                <span class="legal-meta-sep" aria-hidden="true">·</span>
                <span>{t('publicLegal.meta.governingLaw')}: {page.governingLaw}</span>
              {/if}
            </div>
          </header>

          <article class="legal-doc" dir={isRTL ? 'rtl' : 'ltr'}>
            {#each page.sections as section, index}
              <section class="legal-doc__section" id={sectionId(index)}>
                <h2 class="legal-doc__heading">{section.heading}</h2>
                {#each section.body as block}
                  {#if block.type === 'p'}
                    <p class="legal-doc__p">{block.text}</p>
                  {:else if block.type === 'ul'}
                    <ul class="legal-doc__list">
                      {#each block.items as item}
                        <li>{@html item}</li>
                      {/each}
                    </ul>
                  {/if}
                {/each}
              </section>
            {/each}
          </article>
        </div>
      </div>
    </div>
  </main>
{:else}
  <main class="legal-doc-page">
    <div class="legal-doc-page__inner">
      <nav class="legal-doc-page__breadcrumb" aria-label={t('publicLegal.breadcrumbLabel')}>
        <a href="#/" class="legal-back">{backArrow} {t('publicLegal.backToLanding')}</a>
      </nav>
      <section class="legal-not-found" aria-labelledby="legal-not-found-title">
        <h1 id="legal-not-found-title">{t('publicLegal.notFound.title')}</h1>
        <p>{t('publicLegal.notFound.body')}</p>
        <a href="#/" class="legal-not-found__link">{t('publicLegal.notFound.cta')}</a>
      </section>
    </div>
  </main>
{/if}

<style>
  .legal-doc-page {
    flex: 1;
    padding: 3rem 0 5rem;
  }

  .legal-doc-page__inner {
    width: min(1120px, calc(100% - 2rem));
    margin: 0 auto;
    display: grid;
    gap: 2rem;
  }

  .legal-doc-layout {
    display: grid;
    grid-template-columns: minmax(180px, 220px) minmax(0, 760px);
    justify-content: center;
    gap: 3.5rem;
    align-items: start;
  }

  .legal-doc-content {
    display: grid;
    gap: 2rem;
    min-width: 0;
  }

  .legal-outline {
    position: sticky;
    top: 6.25rem;
    display: grid;
    gap: 1.5rem;
    max-height: calc(100vh - 7rem);
    overflow: auto;
    padding: 0.25rem 0 0.5rem;
  }

  .legal-outline__label {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .legal-outline__nav {
    display: grid;
    gap: 0.2rem;
    border-inline-start: 1px solid var(--ui-border-default);
    padding-inline-start: 0.75rem;
  }

  .legal-outline__group {
    display: grid;
    gap: 0.75rem;
  }

  .legal-outline a,
  .legal-outline button {
    width: 100%;
    border: 0;
    border-radius: var(--ui-radius-sm);
    background: transparent;
    color: var(--ui-text-secondary);
    cursor: pointer;
    font: inherit;
    font-size: var(--ui-type-label);
    line-height: 1.45;
    min-height: 44px;
    padding: 0.45rem 0.55rem;
    text-align: start;
    text-decoration: none;
    transition:
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .legal-outline a:hover,
  .legal-outline a.active,
  .legal-outline button:hover,
  .legal-outline button.active {
    background: color-mix(in srgb, var(--ui-surface-secondary) 58%, transparent);
    color: var(--ui-text-primary);
  }

  .legal-outline a:focus-visible,
  .legal-outline button:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .legal-doc-page__breadcrumb {
    display: flex;
    align-items: center;
  }

  .legal-back {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 44px;
    padding-inline: 0.5rem;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    font-weight: 500;
    text-decoration: none;
    transition: color var(--motion-fast) var(--ease-standard);
  }

  .legal-back:hover {
    color: var(--ui-text-primary);
  }

  .legal-back:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
    border-radius: 3px;
  }

  .legal-doc-page__header {
    display: grid;
    gap: 0.75rem;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid var(--ui-border-default);
  }

  .legal-doc-page__title {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(1.5rem, 3.5vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.2;
  }

  .legal-doc-page__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem 0.5rem;
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    line-height: 1.5;
  }

  .legal-meta-sep {
    opacity: 0.5;
  }

  .legal-doc {
    display: grid;
    gap: 2rem;
  }

  .legal-doc__section {
    display: grid;
    gap: 0.75rem;
    scroll-margin-top: 6.25rem;
  }

  .legal-doc__heading {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.4;
  }

  .legal-doc__p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.7;
  }

  .legal-doc__list {
    margin: 0;
    padding-inline-start: 1.25rem;
    display: grid;
    gap: 0.5rem;
    list-style: disc;
  }

  .legal-doc__list li {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.65;
    padding-inline-start: 0.25rem;
  }

  .legal-not-found {
    display: grid;
    gap: 0.85rem;
    max-width: 560px;
    padding: 1.5rem;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-surface-card);
  }

  .legal-not-found h1,
  .legal-not-found p {
    margin: 0;
  }

  .legal-not-found h1 {
    color: var(--ui-text-primary);
    font-size: clamp(1.25rem, 3vw, 1.6rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.25;
  }

  .legal-not-found p {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.6;
  }

  .legal-not-found__link {
    justify-self: start;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
    text-decoration: none;
  }

  .legal-not-found__link:hover {
    color: var(--ui-text-secondary);
  }

  .legal-not-found__link:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
    border-radius: 3px;
  }

  :global([dir="rtl"]) .legal-not-found__link {
    justify-self: end;
  }

  @media (max-width: 580px) {
    .legal-doc-page {
      padding: 2rem 0 4rem;
    }

    .legal-doc-page__inner {
      width: min(100% - 1.5rem, 760px);
      gap: 1.5rem;
    }

    .legal-doc-page__meta {
      flex-direction: column;
      gap: 0.2rem;
    }

    .legal-meta-sep {
      display: none;
    }
  }

  @media (max-width: 980px) {
    .legal-doc-layout {
      grid-template-columns: minmax(0, 760px);
      gap: 2rem;
    }

    .legal-outline__label,
    .legal-outline a,
    .legal-outline button,
    .legal-doc-page__meta {
      font-size: var(--font-size-sm);
    }

    .legal-outline {
      position: static;
      max-height: none;
      overflow: visible;
    }

    .legal-outline__nav {
      display: flex;
      gap: 0.35rem;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      border-inline-start: 0;
      padding: 0 0 0.35rem;
      scrollbar-width: none;
    }

    .legal-outline__nav::-webkit-scrollbar {
      display: none;
    }

    .legal-outline a,
    .legal-outline button {
      width: auto;
      flex: 0 0 auto;
      min-width: max-content;
      max-width: 14rem;
      min-height: 44px;
      border: 1px solid var(--ui-border-default);
      background: var(--ui-surface-card);
    }
  }
</style>
