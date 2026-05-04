<script>
  import { LEGAL_PAGE_MAP } from '../lib/legal/content.js';

  export let slug = '';

  $: page = LEGAL_PAGE_MAP[slug] ?? null;
</script>

{#if page}
  <main class="legal-doc-page">
    <div class="legal-doc-page__inner">
      <nav class="legal-doc-page__breadcrumb" aria-label="Breadcrumb">
        <a href="#/legal" class="legal-back">← Legal</a>
      </nav>

      <header class="legal-doc-page__header">
        <h1 class="legal-doc-page__title">{page.title}</h1>
        <div class="legal-doc-page__meta">
          <span>Effective date: {page.effectiveDate}</span>
          {#if page.appliesTo}
            <span class="legal-meta-sep" aria-hidden="true">·</span>
            <span>Applies to: {page.appliesTo}</span>
          {/if}
          {#if page.governingLaw}
            <span class="legal-meta-sep" aria-hidden="true">·</span>
            <span>Governing law: {page.governingLaw}</span>
          {/if}
        </div>
      </header>

      <article class="legal-doc">
        {#each page.sections as section}
          <section class="legal-doc__section">
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
  </main>
{:else}
  <main class="legal-doc-page">
    <div class="legal-doc-page__inner">
      <nav class="legal-doc-page__breadcrumb" aria-label="Breadcrumb">
        <a href="#/legal" class="legal-back">← Legal</a>
      </nav>
      <p style="color: var(--ui-text-secondary); margin-top: 2rem;">Document not found.</p>
    </div>
  </main>
{/if}

<style>
  .legal-doc-page {
    flex: 1;
    padding: 3rem 0 5rem;
  }

  .legal-doc-page__inner {
    width: min(760px, calc(100% - 2rem));
    margin: 0 auto;
    display: grid;
    gap: 2rem;
  }

  .legal-doc-page__breadcrumb {
    display: flex;
    align-items: center;
  }

  .legal-back {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
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
</style>
