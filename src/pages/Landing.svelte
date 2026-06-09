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

      <div class="lp-hero__visual" aria-hidden="true">
        <div class="mk">
          <div class="mk__chrome">
            <span class="mk__dot"></span>
            <span class="mk__dot"></span>
            <span class="mk__dot"></span>
            <span class="mk__url">{t('landing.mockup.url')}</span>
          </div>
          <div class="mk__app">
            <aside class="mk__sidebar">
              <div class="mk__brand">{t('publicHeader.brandName')}</div>
              <div class="mk__nav">
                <div class="mk__navitem mk__navitem--active">{t('landing.mockup.navHome')}</div>
                <div class="mk__navitem">{t('landing.mockup.navStudyHub')}</div>
                <div class="mk__navitem">{t('landing.mockup.navSettings')}</div>
              </div>
            </aside>
            <div class="mk__main">
              <div class="mk__header">
                <span class="mk__eyebrow">{t('landing.mockup.dashboardEyebrow')}</span>
                <h3>{t('landing.mockup.dashboardTitle')}</h3>
                <p>{t('landing.mockup.dashboardSubtitle')}</p>
              </div>

              <div class="mk__flow">
                <div class="mk__upload">
                  <span class="mk__fileicon" aria-hidden="true"></span>
                  <div>
                    <p>{t('landing.mockup.uploadTitle')}</p>
                    <span>{t('landing.mockup.uploadMeta')}</span>
                  </div>
                </div>

                <div class="mk__chooser">
                  <div class="mk__chooser-head">
                    <p>{t('landing.mockup.chooseTitle')}</p>
                    <span>{t('landing.mockup.chooseSubtitle')}</span>
                  </div>
                  <div class="mk__choice-grid">
                    <div class="mk__choice mk__choice--selected">
                      <span>{t('landing.mockup.summaryTitle')}</span>
                      <p>{t('landing.mockup.summaryText')}</p>
                      <strong>{t('landing.mockup.selected')}</strong>
                    </div>
                    <div class="mk__choice mk__choice--selected">
                      <span>{t('landing.mockup.flashcardsTitle')}</span>
                      <p>{t('landing.mockup.flashcardsText')}</p>
                      <strong>{t('landing.mockup.selected')}</strong>
                    </div>
                    <div class="mk__choice mk__choice--selected">
                      <span>{t('landing.mockup.examTitle')}</span>
                      <p>{t('landing.mockup.examText')}</p>
                      <strong>{t('landing.mockup.selected')}</strong>
                    </div>
                  </div>
                  <div class="mk__action">
                    <span>{t('landing.mockup.generateSelected')}</span>
                  </div>
                </div>

                <div class="mk__progress">
                  <div>
                    <p>{t('landing.mockup.progressTitle')}</p>
                    <span>{t('landing.mockup.progressMeta')}</span>
                  </div>
                  <strong>{t('landing.mockup.progressValue')}</strong>
                  <div class="mk__bar" aria-hidden="true"><span></span></div>
                </div>

                <div class="mk__hub">
                  <div class="mk__hub-head">
                    <div>
                      <p>{t('landing.mockup.hubTitle')}</p>
                      <span>{t('landing.mockup.hubSubtitle')}</span>
                    </div>
                    <strong>{t('landing.mockup.ready')}</strong>
                  </div>
                  <div class="mk__hub-doc">
                    <span>{t('landing.mockup.documentTitle')}</span>
                    <div>
                      <em>{t('landing.mockup.summaryReady')}</em>
                      <em>{t('landing.mockup.flashcardsReady')}</em>
                      <em>{t('landing.mockup.examReady')}</em>
                    </div>
                    <strong>{t('landing.mockup.open')}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

      <div class="lp-feature-rows">
        {#each features as feature, i}
          <div class="lp-feature-row" class:lp-feature-row--reverse={i === 1}>
            <div class="lp-feature-text">
              <p class="lp-eyebrow">{t(feature.eyebrow)}</p>
              <h3 class="lp-feature-title">{t(feature.title)}</h3>
              <p class="lp-feature-body">{t(feature.body)}</p>
            </div>
            <div class="lp-feature-visual" aria-hidden="true">
              {#if i === 0}
                <div class="mk mk--panel">
                  <div class="mk__content">
                    <span class="mk__seclabel">{t('landing.mockup.featureSummaryEyebrow')}</span>
                    <p class="mk__line">{t('landing.mockup.summaryLine1')}</p>
                    <p class="mk__line">{t('landing.mockup.summaryLine2')}</p>
                    <p class="mk__line">{t('landing.mockup.summaryLine3')}</p>
                    <span class="mk__seclabel">{t('landing.mockup.mainArguments')}</span>
                    <p class="mk__line">{t('landing.mockup.argumentLine1')}</p>
                    <p class="mk__line">{t('landing.mockup.argumentLine2')}</p>
                  </div>
                </div>
              {:else if i === 1}
                <div class="mk mk--panel mk--card">
                  <span class="mk__seclabel">{t('landing.mockup.featureFlashcardEyebrow')}</span>
                  <p class="mk__cardq">{t('landing.mockup.flashcardQuestion')}</p>
                  <div class="mk__carddiv"></div>
                  <p class="mk__carda">{t('landing.mockup.flashcardAnswer')}</p>
                </div>
              {:else}
                <div class="mk mk--panel mk--exam">
                  <span class="mk__seclabel">{t('landing.mockup.featureExamEyebrow')}</span>
                  <p class="mk__cardq">{t('landing.mockup.examQuestion')}</p>
                  <ul class="mk__options">
                    <li class="mk__opt"><span class="mk__optkey">A</span> {t('landing.mockup.optionA')}</li>
                    <li class="mk__opt mk__opt--correct"><span class="mk__optkey">B</span> {t('landing.mockup.optionB')}</li>
                    <li class="mk__opt"><span class="mk__optkey">C</span> {t('landing.mockup.optionC')}</li>
                    <li class="mk__opt"><span class="mk__optkey">D</span> {t('landing.mockup.optionD')}</li>
                  </ul>
                </div>
              {/if}
            </div>
          </div>
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
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: clamp(2.5rem, 5vw, 4.5rem);
    align-items: center;
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
    max-width: 30rem;
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

  .lp-hero__visual {
    min-width: 0;
  }

  /* ── Product mockup (always dark) ──────────────── */
  .mk {
    border: 1px solid #1e1e1e;
    border-radius: 14px;
    background: #0a0a0a;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.65);
  }

  .mk__chrome {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 0.9rem;
    border-bottom: 1px solid #1e1e1e;
    background: #0d0d0d;
  }

  .mk__dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: #2a2a2a;
  }

  .mk__url {
    margin-inline-start: 0.6rem;
    color: #444;
    font-size: 0.65rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .mk__app {
    display: grid;
    grid-template-columns: 9rem 1fr;
    min-height: 19rem;
  }

  .mk__sidebar {
    padding: 0.9rem 0.75rem;
    border-inline-end: 1px solid #1e1e1e;
    background: #0d0d0d;
  }

  .mk__brand {
    margin-bottom: 1rem;
    color: #fafafa;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .mk__nav {
    display: grid;
    gap: 0.25rem;
  }

  .mk__navitem {
    padding: 0.4rem 0.55rem;
    border-radius: 6px;
    color: #888;
    font-size: 0.72rem;
    font-weight: 500;
  }

  .mk__navitem--active {
    background: rgba(255, 255, 255, 0.07);
    color: #fafafa;
  }

  .mk__main {
    min-width: 0;
  }

  .mk__header {
    padding: 1rem 1rem 0.85rem;
    border-bottom: 1px solid #1e1e1e;
  }

  .mk__eyebrow {
    display: block;
    margin-bottom: 0.35rem;
    color: #888;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .mk__header h3,
  .mk__header p,
  .mk__upload p,
  .mk__chooser-head p,
  .mk__choice p,
  .mk__progress p,
  .mk__hub-head p {
    margin: 0;
  }

  .mk__header h3 {
    color: #fafafa;
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .mk__header p {
    margin-top: 0.35rem;
    max-width: 28rem;
    color: #888;
    font-size: 0.68rem;
    line-height: 1.5;
  }

  .mk__flow {
    display: grid;
    gap: 0.65rem;
    padding: 0.8rem 1rem 1rem;
  }

  .mk__upload,
  .mk__chooser,
  .mk__progress,
  .mk__hub {
    border: 1px solid #1e1e1e;
    border-radius: 10px;
    background: #0d0d0d;
  }

  .mk__upload {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.7rem 0.8rem;
  }

  .mk__fileicon {
    position: relative;
    flex: 0 0 auto;
    width: 1.75rem;
    height: 2.1rem;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    background: #111;
  }

  .mk__fileicon::after {
    content: "";
    position: absolute;
    inset-block-start: 0.42rem;
    inset-inline: 0.42rem;
    height: 1px;
    background: #444;
    box-shadow: 0 0.42rem 0 #333, 0 0.84rem 0 #333;
  }

  .mk__upload p,
  .mk__chooser-head p,
  .mk__progress p,
  .mk__hub-head p,
  .mk__hub-doc > span {
    color: #fafafa;
    font-size: 0.76rem;
    font-weight: 650;
    line-height: 1.35;
  }

  .mk__upload span:not(.mk__fileicon),
  .mk__chooser-head span,
  .mk__progress span,
  .mk__hub-head span {
    color: #888;
    font-size: 0.62rem;
    line-height: 1.45;
  }

  .mk__chooser {
    display: grid;
    gap: 0.65rem;
    padding: 0.75rem;
  }

  .mk__chooser-head {
    display: grid;
    gap: 0.25rem;
  }

  .mk__choice-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .mk__choice {
    display: grid;
    gap: 0.35rem;
    min-height: 6.7rem;
    padding: 0.6rem;
    border: 1px solid #242424;
    border-radius: 8px;
    background: #090909;
  }

  .mk__choice span {
    color: #fafafa;
    font-size: 0.68rem;
    font-weight: 650;
  }

  .mk__choice p {
    color: #888;
    font-size: 0.58rem;
    line-height: 1.45;
  }

  .mk__choice strong,
  .mk__hub-head strong {
    justify-self: start;
    align-self: end;
    padding: 0.18rem 0.45rem;
    border: 1px solid rgba(34, 197, 94, 0.25);
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    font-size: 0.54rem;
    font-style: normal;
    font-weight: 700;
    line-height: 1.2;
  }

  .mk__action {
    display: flex;
    justify-content: flex-end;
  }

  .mk__action span {
    display: inline-flex;
    align-items: center;
    min-height: 1.8rem;
    padding-inline: 0.75rem;
    border-radius: 999px;
    background: #fafafa;
    color: #0a0a0a;
    font-size: 0.62rem;
    font-weight: 700;
  }

  .mk__progress {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.5rem 0.75rem;
    padding: 0.7rem 0.8rem;
  }

  .mk__progress strong {
    color: #fafafa;
    font-size: 0.72rem;
  }

  .mk__bar {
    grid-column: 1 / -1;
    height: 0.38rem;
    overflow: hidden;
    border-radius: 999px;
    background: #1e1e1e;
  }

  .mk__bar span {
    display: block;
    width: 72%;
    height: 100%;
    border-radius: inherit;
    background: #fafafa;
  }

  .mk__hub {
    display: grid;
    gap: 0.6rem;
    padding: 0.75rem;
  }

  .mk__hub-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .mk__hub-doc {
    display: grid;
    gap: 0.5rem;
    padding: 0.65rem;
    border: 1px solid #242424;
    border-radius: 8px;
    background: #090909;
  }

  .mk__hub-doc div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .mk__hub-doc em {
    padding: 0.18rem 0.4rem;
    border: 1px solid #242424;
    border-radius: 999px;
    color: #888;
    font-size: 0.55rem;
    font-style: normal;
    line-height: 1.2;
  }

  .mk__hub-doc strong {
    justify-self: start;
    color: #fafafa;
    font-size: 0.62rem;
    font-weight: 700;
  }

  .mk__content {
    padding: 1rem;
  }

  .mk__seclabel {
    display: block;
    margin-bottom: 0.5rem;
    color: #888;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .mk__line {
    margin: 0 0 0.45rem;
    color: #fafafa;
    font-size: 0.74rem;
    line-height: 1.5;
  }

  .mk__line + .mk__seclabel {
    margin-top: 1rem;
  }

  /* Mockup as standalone feature panel */
  .mk--panel {
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  }

  .mk--card,
  .mk--exam {
    padding: 1.5rem;
  }

  .mk__cardq {
    margin: 0;
    color: #fafafa;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .mk__carddiv {
    height: 1px;
    margin: 1.1rem 0;
    background: #1e1e1e;
  }

  .mk__carda {
    margin: 0;
    color: #888;
    font-size: 0.85rem;
    line-height: 1.6;
  }

  .mk__options {
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }

  .mk__opt {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid #1e1e1e;
    border-radius: 8px;
    color: #888;
    font-size: 0.8rem;
  }

  .mk__optkey {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 5px;
    background: #1e1e1e;
    color: #fafafa;
    font-size: 0.68rem;
    font-weight: 700;
  }

  .mk__opt--correct {
    border-color: rgba(34, 197, 94, 0.25);
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }

  .mk__opt--correct .mk__optkey {
    background: rgba(34, 197, 94, 0.25);
    color: #22c55e;
  }

  /* ── 2 · Credibility strip ─────────────────────── */
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

  .lp-feature-rows {
    display: grid;
    gap: clamp(4rem, 8vw, 7rem);
  }

  .lp-feature-row {
    display: flex;
    align-items: center;
    gap: 4rem;
  }

  .lp-feature-row--reverse {
    flex-direction: row-reverse;
  }

  .lp-feature-text {
    flex: 1 1 0;
    min-width: 0;
  }

  .lp-feature-visual {
    flex: 1 1 0;
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
    .lp-hero__grid {
      grid-template-columns: 1fr;
    }

    .lp-hero__visual {
      order: -1;
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
    .mk__app {
      grid-template-columns: 1fr;
    }

    .mk__sidebar {
      display: none;
    }

    .mk__choice-grid {
      grid-template-columns: 1fr;
    }

    .mk__choice {
      min-height: 0;
    }

    .lp-feature-row,
    .lp-feature-row--reverse {
      flex-direction: column;
      gap: 2rem;
    }

    .lp-feature-text {
      width: 100%;
    }
  }

  @media (max-width: 500px) {
    .lp-hero__visual {
      display: none;
    }
  }
</style>
