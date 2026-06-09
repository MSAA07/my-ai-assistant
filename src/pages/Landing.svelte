<script>
  import { tick } from 'svelte';
  import { t } from '../lib/i18n/t.js';
  import { LANDING_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../routes.js';
  import { currentPath, routeParams, router } from '../stores/router.js';

  const features = [
    { eyebrow: 'landing.feature1Eyebrow', title: 'landing.feature1Title', body: 'landing.feature1Body' },
    { eyebrow: 'landing.feature2Eyebrow', title: 'landing.feature2Title', body: 'landing.feature2Body' },
    { eyebrow: 'landing.feature3Eyebrow', title: 'landing.feature3Title', body: 'landing.feature3Body' }
  ];

  const steps = [
    { num: '01', title: 'landing.step1Title', body: 'landing.step1Body' },
    { num: '02', title: 'landing.step2Title', body: 'landing.step2Body' },
    { num: '03', title: 'landing.step3Title', body: 'landing.step3Body' }
  ];

  const faqs = [
    { q: 'landing.faq1Q', a: 'landing.faq1A' },
    { q: 'landing.faq2Q', a: 'landing.faq2A' },
    { q: 'landing.faq3Q', a: 'landing.faq3A' },
    { q: 'landing.faq4Q', a: 'landing.faq4A' },
    { q: 'landing.faq5Q', a: 'landing.faq5A' },
    { q: 'landing.faq6Q', a: 'landing.faq6A' }
  ];

  let openFaq = -1;
  function toggleFaq(i) {
    openFaq = openFaq === i ? -1 : i;
  }

  let syncedSection = '';

  async function scrollToSection(sectionId, behavior = 'smooth') {
    await tick();
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior, block: 'start' });
  }

  $: if ($currentPath === LANDING_PATH) {
    const requestedSection = $routeParams.section ?? '';
    if (requestedSection && requestedSection !== syncedSection) {
      syncedSection = requestedSection;
      scrollToSection(requestedSection, 'smooth');
    }
    if (!requestedSection) {
      syncedSection = '';
    }
  }

  function goTo(path) {
    router.navigate(path);
  }
</script>

<main class="lp">

  <!-- ── 1 · HERO ─────────────────────────────────── -->
  <section class="lp-hero">
    <div class="lp-container lp-hero__grid">
      <div class="lp-hero__copy">
        <span class="lp-badge">{t('landing.heroBadge')}</span>
        <h1 class="lp-hero__headline">
          <span>{t('landing.heroHeadline1')}</span>
          <span>{t('landing.heroHeadline2')}</span>
          <span>{t('landing.heroHeadline3')}</span>
        </h1>
        <p class="lp-hero__sub">{t('landing.heroSub')}</p>
        <button class="lp-btn lp-btn--primary" type="button" on:click={() => goTo(SIGN_UP_PATH)}>
          {t('landing.heroCta')}
        </button>
        <p class="lp-hero__trust">{t('landing.heroTrust')}</p>
      </div>

    </div>
  </section>

  <!-- ── 2 · CREDIBILITY STRIP ────────────────────── -->
  <section class="lp-strip">
    <p class="lp-strip__text">{t('landing.credibilityStrip')}</p>
  </section>

  <!-- ── 3 · PROBLEM STATEMENT ────────────────────── -->
  <section class="lp-problem">
    <div class="lp-container lp-problem__inner">
      <p class="lp-eyebrow">{t('landing.problemEyebrow')}</p>
      <h2 class="lp-problem__headline">
        <span>{t('landing.problemHeadline1')}</span>
        <span>{t('landing.problemHeadline2')}</span>
      </h2>
      <p class="lp-problem__body">{t('landing.problemBody')}</p>
    </div>
  </section>

  <!-- ── 4 · FEATURES ─────────────────────────────── -->
  <section id="features" class="lp-features">
    <div class="lp-container">
      <div class="lp-section-head">
        <p class="lp-eyebrow">{t('landing.featuresEyebrow')}</p>
        <h2 class="lp-h2">{t('landing.featuresHeadline')}</h2>
      </div>

      <div class="lp-feature-grid">
        {#each features as feature, i}
          <article class="lp-feature-card" class:lp-feature-card--wide={i === 0}>
            <div class="lp-feature-card__copy">
              <p class="lp-eyebrow">{t(feature.eyebrow)}</p>
              <h3 class="lp-feature-title">{t(feature.title)}</h3>
              <p class="lp-feature-body">{t(feature.body)}</p>
            </div>

            <div class="lp-feature-card__visual" aria-hidden="true">
              {#if i === 0}
                <div class="pv pv--summary">
                  <div class="pv__header">
                    <span>{t('landing.mockup.featureSummaryEyebrow')}</span>
                    <strong>{t('landing.mockup.ready')}</strong>
                  </div>
                  <div class="pv__summary-lines">
                    <p>{t('landing.mockup.summaryLine1')}</p>
                    <p>{t('landing.mockup.summaryLine2')}</p>
                    <p>{t('landing.mockup.summaryLine3')}</p>
                  </div>
                  <div class="pv__note-grid">
                    <span>{t('landing.mockup.keyConcepts')}</span>
                    <span>{t('landing.mockup.mainArguments')}</span>
                  </div>
                </div>
              {:else if i === 1}
                <div class="pv pv--flashcard">
                  <div class="pv__header">
                    <span>{t('landing.mockup.featureFlashcardEyebrow')}</span>
                    <strong>{t('landing.mockup.flashcardCount')} {t('landing.mockup.flashcardLabel')}</strong>
                  </div>
                  <div class="pv__flashcard">
                    <p>{t('landing.mockup.flashcardQuestion')}</p>
                    <span></span>
                    <p>{t('landing.mockup.flashcardAnswer')}</p>
                  </div>
                </div>
              {:else}
                <div class="pv pv--exam">
                  <div class="pv__header">
                    <span>{t('landing.mockup.featureExamEyebrow')}</span>
                    <strong>{t('landing.mockup.questionCount')} {t('landing.mockup.questionLabel')}</strong>
                  </div>
                  <p class="pv__question">{t('landing.mockup.examQuestion')}</p>
                  <ul class="pv__options">
                    <li><span>{t('landing.mockup.optionKeyA')}</span>{t('landing.mockup.optionA')}</li>
                    <li class="pv__option--correct"><span>{t('landing.mockup.optionKeyB')}</span>{t('landing.mockup.optionB')}</li>
                    <li><span>{t('landing.mockup.optionKeyC')}</span>{t('landing.mockup.optionC')}</li>
                    <li><span>{t('landing.mockup.optionKeyD')}</span>{t('landing.mockup.optionD')}</li>
                  </ul>
                </div>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── 5 · HOW IT WORKS ─────────────────────────── -->
  <section id="how-it-works" class="lp-how">
    <div class="lp-container">
      <div class="lp-section-head">
        <p class="lp-eyebrow">{t('landing.howEyebrow')}</p>
        <h2 class="lp-h2">{t('landing.howHeadline')}</h2>
      </div>

      <div class="lp-steps">
        {#each steps as step, i}
          {#if i > 0}
            <span class="lp-step-arrow" aria-hidden="true">→</span>
          {/if}
          <div class="lp-step">
            <span class="lp-step__num">{step.num}</span>
            <h3 class="lp-step__title">{t(step.title)}</h3>
            <p class="lp-step__body">{t(step.body)}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── 6 · FAQ ──────────────────────────────────── -->
  <section class="lp-faq">
    <div class="lp-faq__inner">
      <div class="lp-section-head">
        <p class="lp-eyebrow">{t('landing.faqEyebrow')}</p>
        <h2 class="lp-h2">{t('landing.faqHeadline')}</h2>
      </div>

      <div class="lp-faq__list">
        {#each faqs as faq, i}
          <div class="lp-faq__item" class:lp-faq__item--last={i === faqs.length - 1}>
            <button
              class="lp-faq__q"
              type="button"
              aria-expanded={openFaq === i}
              on:click={() => toggleFaq(i)}
            >
              <span>{t(faq.q)}</span>
              <span class="lp-faq__chev" class:lp-faq__chev--open={openFaq === i} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            {#if openFaq === i}
              <p class="lp-faq__a">{t(faq.a)}</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── 7 · FINAL CTA ────────────────────────────── -->
  <section class="lp-cta">
    <div class="lp-cta__inner">
      <h2 class="lp-cta__headline">{t('landing.ctaHeadline')}</h2>
      <p class="lp-cta__sub">{t('landing.ctaSub')}</p>
      <button class="lp-btn lp-btn--primary" type="button" on:click={() => goTo(SIGN_UP_PATH)}>
        {t('landing.ctaButton')}
      </button>
      <p class="lp-cta__foot">{t('landing.heroTrust')}</p>
    </div>
  </section>

</main>

<style>
  /* ── Foundations ───────────────────────────────── */
  .lp {
    display: block;
    color: var(--ui-text-primary);
  }

  .lp-container {
    width: 100%;
    max-width: 72rem;
    margin-inline: auto;
    padding-inline: 1.5rem;
  }

  .lp-eyebrow {
    margin: 0 0 0.75rem;
    color: var(--ui-text-muted);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .lp-h2 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.015em;
    line-height: 1.08;
  }

  .lp-section-head {
    max-width: 36rem;
    margin-bottom: clamp(3rem, 5vw, 5rem);
  }

  /* ── Primary button ────────────────────────────── */
  .lp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 150ms ease;
  }

  .lp-btn--primary {
    padding: 0.85rem 2.25rem;
    background: #fafafa;
    color: #0a0a0a;
  }

  .lp-btn--primary:hover {
    opacity: 0.85;
  }

  /* ── 1 · Hero ──────────────────────────────────── */
  .lp-hero {
    position: relative;
    overflow: hidden;
    padding-block: clamp(4rem, 9vw, 8rem);
    background:
      radial-gradient(60% 80% at 100% 0%, color-mix(in srgb, var(--ui-text-primary) 5%, transparent), transparent),
      var(--ui-bg-page);
  }

  .lp-hero__grid {
    display: block;
    max-width: 48rem;
    text-align: center;
  }

  .lp-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.85rem;
    margin-bottom: 1.75rem;
    border: 1px solid var(--ui-border-default);
    border-radius: 999px;
    background: var(--ui-surface-card);
    color: var(--ui-text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .lp-hero__headline {
    margin: 0 0 1.5rem;
    font-size: clamp(3rem, 6vw, 5rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.025em;
  }

  .lp-hero__headline span {
    display: block;
  }

  .lp-hero__sub {
    margin: 0 0 2rem;
    max-width: 36rem;
    margin-inline: auto;
    color: var(--ui-text-secondary);
    font-size: clamp(1rem, 1.5vw, 1.1rem);
    line-height: 1.7;
  }

  .lp-hero__trust {
    margin: 1rem 0 0;
    color: var(--ui-text-muted);
    font-size: 0.75rem;
    line-height: 1.6;
  }

  /* Feature previews */
  .pv {
    display: grid;
    gap: 1rem;
    min-height: 18rem;
    padding: 1.25rem;
    border: 1px solid #1f1f1f;
    border-radius: 10px;
    background: #050505;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .pv__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid #1f1f1f;
  }

  .pv__header span {
    color: #8a8a8a;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .pv__header strong {
    flex: 0 0 auto;
    padding: 0.24rem 0.5rem;
    border: 1px solid rgba(34, 197, 94, 0.25);
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.09);
    color: #22c55e;
    font-size: 0.62rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .pv__summary-lines {
    display: grid;
    gap: 0.7rem;
  }

  .pv__summary-lines p,
  .pv__flashcard p,
  .pv__question {
    margin: 0;
    color: #fafafa;
    font-size: 0.92rem;
    line-height: 1.65;
  }

  .pv__summary-lines p {
    padding-inline-start: 0.9rem;
    border-inline-start: 1px solid #2a2a2a;
  }

  .pv__note-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: auto;
  }

  .pv__note-grid span {
    min-height: 4.5rem;
    padding: 0.8rem;
    border: 1px solid #1f1f1f;
    border-radius: 8px;
    color: #8a8a8a;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 1.4;
    text-transform: uppercase;
  }

  .pv__flashcard {
    display: grid;
    align-content: center;
    gap: 1rem;
    min-height: 12rem;
    padding: 1rem;
    border: 1px solid #1f1f1f;
    border-radius: 9px;
    background: #090909;
  }

  .pv__flashcard span {
    display: block;
    height: 1px;
    background: #1f1f1f;
  }

  .pv__flashcard p:last-child {
    color: #8a8a8a;
    font-size: 0.86rem;
  }

  .pv__options {
    display: grid;
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .pv__options li {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 2.75rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid #1f1f1f;
    border-radius: 8px;
    color: #8a8a8a;
    font-size: 0.84rem;
    line-height: 1.35;
  }

  .pv__options span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.35rem;
    height: 1.35rem;
    flex: 0 0 auto;
    border-radius: 6px;
    background: #1f1f1f;
    color: #fafafa;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .pv__option--correct {
    border-color: rgba(34, 197, 94, 0.25) !important;
    background: rgba(34, 197, 94, 0.08);
    color: #22c55e !important;
  }

  .lp-strip {
    padding-block: 1.25rem;
    border-block: 1px solid color-mix(in srgb, var(--ui-border-default) 30%, transparent);
    background: var(--ui-bg-page);
  }

  .lp-strip__text {
    margin: 0;
    text-align: center;
    color: var(--ui-text-muted);
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* ── 3 · Problem ───────────────────────────────── */
  .lp-problem {
    padding-block: clamp(5rem, 9vw, 9rem);
    background: color-mix(in srgb, var(--ui-surface-card) 35%, var(--ui-bg-page));
  }

  .lp-problem__inner {
    max-width: 52rem;
    margin-inline: auto;
  }

  .lp-problem__headline {
    margin: 0 0 1.75rem;
    font-size: clamp(2.25rem, 4vw, 3.25rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .lp-problem__headline span {
    display: block;
  }

  .lp-problem__body {
    margin: 0;
    max-width: 42rem;
    color: var(--ui-text-secondary);
    font-size: 1rem;
    line-height: 1.8;
  }

  /* ── 4 · Features ──────────────────────────────── */
  .lp-features {
    padding-block: clamp(5rem, 9vw, 9rem);
    background: var(--ui-bg-page);
  }

  .lp-feature-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 72%, transparent);
    border-radius: 12px;
    overflow: hidden;
    background: #050505;
  }

  .lp-feature-card {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: clamp(2rem, 4vw, 3rem);
    min-height: 36rem;
    padding: clamp(1.5rem, 3vw, 2rem);
    border-block-start: 1px solid color-mix(in srgb, var(--ui-border-default) 72%, transparent);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 22%, transparent), transparent 42%),
      #050505;
  }

  .lp-feature-card:nth-child(1),
  .lp-feature-card:nth-child(2) {
    border-block-start: 0;
  }

  .lp-feature-card:nth-child(odd) {
    border-inline-end: 1px solid color-mix(in srgb, var(--ui-border-default) 72%, transparent);
  }

  .lp-feature-card--wide {
    grid-column: 1 / -1;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    grid-template-rows: auto;
    align-items: center;
  }

  .lp-feature-card__copy,
  .lp-feature-card__visual {
    min-width: 0;
  }

  .lp-feature-title {
    margin: 0 0 1rem;
    color: var(--ui-text-primary);
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .lp-feature-body {
    margin: 0;
    max-width: 34rem;
    color: var(--ui-text-secondary);
    font-size: 1rem;
    line-height: 1.75;
  }

  /* ── 5 · How it works ──────────────────────────── */
  .lp-how {
    padding-block: clamp(5rem, 8vw, 8rem);
    border-block: 1px solid color-mix(in srgb, var(--ui-border-default) 40%, transparent);
    background: color-mix(in srgb, var(--ui-surface-card) 20%, var(--ui-bg-page));
  }

  .lp-steps {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
  }

  .lp-step {
    flex: 1 1 0;
    min-width: 0;
  }

  .lp-step__num {
    display: block;
    margin-bottom: 0.75rem;
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.03em;
    color: color-mix(in srgb, var(--ui-text-muted) 40%, transparent);
  }

  .lp-step__title {
    margin: 0 0 0.5rem;
    color: var(--ui-text-primary);
    font-size: 1.05rem;
    font-weight: 700;
  }

  .lp-step__body {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.875rem;
    line-height: 1.65;
  }

  .lp-step-arrow {
    align-self: center;
    flex: 0 0 auto;
    color: var(--ui-border-strong);
    font-size: 1.25rem;
  }

  /* ── 6 · FAQ ───────────────────────────────────── */
  .lp-faq {
    padding-block: clamp(5rem, 8vw, 8rem);
    background: var(--ui-bg-page);
  }

  .lp-faq__inner {
    width: 100%;
    max-width: 52rem;
    margin-inline: auto;
    padding-inline: 1.5rem;
  }

  .lp-faq__item {
    border-top: 1px solid var(--ui-border-default);
  }

  .lp-faq__item--last {
    border-bottom: 1px solid var(--ui-border-default);
  }

  .lp-faq__q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    min-height: 44px;
    padding: 1.1rem 0;
    border: none;
    background: transparent;
    color: var(--ui-text-secondary);
    font-size: 0.95rem;
    font-weight: 600;
    text-align: start;
    cursor: pointer;
    transition: color 150ms ease;
  }

  .lp-faq__q:hover {
    color: var(--ui-text-primary);
  }

  .lp-faq__chev {
    flex-shrink: 0;
    display: inline-flex;
    color: var(--ui-text-muted);
    transition: transform 200ms ease;
  }

  .lp-faq__chev--open {
    transform: rotate(180deg);
  }

  .lp-faq__a {
    margin: 0;
    padding: 0 0 1.25rem;
    max-width: 44rem;
    color: var(--ui-text-secondary);
    font-size: 0.9rem;
    line-height: 1.75;
  }

  /* ── 7 · Final CTA ─────────────────────────────── */
  .lp-cta {
    padding-block: clamp(6rem, 10vw, 10rem);
    background:
      radial-gradient(60% 90% at 50% 100%, color-mix(in srgb, var(--ui-text-primary) 5%, transparent), transparent),
      var(--ui-bg-page);
  }

  .lp-cta__inner {
    width: 100%;
    max-width: 36rem;
    margin-inline: auto;
    padding-inline: 1.5rem;
    text-align: center;
  }

  .lp-cta__headline {
    margin: 0 0 1rem;
    color: var(--ui-text-primary);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .lp-cta__sub {
    margin: 0 0 2rem;
    color: var(--ui-text-secondary);
    font-size: 1.05rem;
    line-height: 1.6;
  }

  .lp-cta__foot {
    margin: 1rem 0 0;
    color: var(--ui-text-muted);
    font-size: 0.75rem;
  }

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 900px) {
    .lp-feature-grid,
    .lp-feature-card--wide {
      grid-template-columns: 1fr;
    }

    .lp-feature-card:nth-child(odd) {
      border-inline-end: 0;
    }

    .lp-feature-card:nth-child(2) {
      border-block-start: 1px solid color-mix(in srgb, var(--ui-border-default) 72%, transparent);
    }

    .lp-steps {
      flex-direction: column;
      gap: 2.5rem;
    }

    .lp-step-arrow {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .lp-feature-card {
      min-height: 0;
    }

    .pv,
    .pv__flashcard {
      min-height: 0;
    }

    .pv__header {
      align-items: flex-start;
      flex-direction: column;
    }

    .pv__note-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
