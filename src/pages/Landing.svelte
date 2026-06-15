<script>
  import { tick } from 'svelte';
  import { t } from '../lib/i18n/t.js';
  import { LANDING_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../routes.js';
  import { currentPath, routeParams, router } from '../stores/router.js';

  const tourSteps = [
    { num: '01', tone: 'blue', eyebrow: 'landing.tour.step1Eyebrow', title: 'landing.tour.step1Title', body: 'landing.tour.step1Body' },
    { num: '02', tone: 'green', eyebrow: 'landing.tour.step2Eyebrow', title: 'landing.tour.step2Title', body: 'landing.tour.step2Body' },
    { num: '03', tone: 'amber', eyebrow: 'landing.tour.step3Eyebrow', title: 'landing.tour.step3Title', body: 'landing.tour.step3Body' }
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
  <section id="features" class="lp-tour">
    <div class="lp-container">
      <div class="lp-section-head lp-section-head--center">
        <p class="lp-eyebrow">{t('landing.tour.eyebrow')}</p>
        <h2 class="lp-h2">{t('landing.tour.headline')}</h2>
        <p class="lp-section-sub">{t('landing.tour.sub')}</p>
      </div>

      <div class="tour-shell">
        <div class="tour-shell__rail" aria-hidden="true"></div>

        {#each tourSteps as step, i}
          <article class={`tour-step tour-step--${step.tone}`}>
            <div class="tour-step__copy">
              <span class="tour-step__num">{step.num}</span>
              <p class="lp-eyebrow">{t(step.eyebrow)}</p>
              <h3>{t(step.title)}</h3>
              <p>{t(step.body)}</p>
            </div>

            <div class="tour-step__visual" aria-hidden="true">
              {#if i === 0}
                <div class="tour-upload">
                  <div class="tour-upload__drop">
                    <span class="tour-upload__icon"></span>
                    <div>
                      <p>{t('landing.tour.uploadDropTitle')}</p>
                      <span>{t('landing.tour.uploadDropMeta')}</span>
                    </div>
                  </div>
                  <div class="tour-file">
                    <span></span>
                    <div>
                      <p>{t('landing.mockup.uploadTitle')}</p>
                      <small>{t('landing.mockup.uploadMeta')}</small>
                    </div>
                    <strong>{t('landing.mockup.ready')}</strong>
                  </div>
                </div>
              {:else if i === 1}
                <div class="tour-picker">
                  <div class="tour-picker__head">
                    <p>{t('landing.mockup.chooseTitle')}</p>
                    <span>{t('landing.tour.chooseHint')}</span>
                  </div>
                  <div class="tour-tool-grid">
                    <div class="tour-tool tour-tool--summary">
                      <strong>{t('landing.mockup.summaryTitle')}</strong>
                      <p>{t('landing.mockup.summaryText')}</p>
                      <span>{t('landing.mockup.selected')}</span>
                    </div>
                    <div class="tour-tool tour-tool--flashcards">
                      <strong>{t('landing.mockup.flashcardsTitle')}</strong>
                      <p>{t('landing.mockup.flashcardsText')}</p>
                      <span>{t('landing.mockup.selected')}</span>
                    </div>
                    <div class="tour-tool tour-tool--exam">
                      <strong>{t('landing.mockup.examTitle')}</strong>
                      <p>{t('landing.mockup.examText')}</p>
                      <span>{t('landing.mockup.selected')}</span>
                    </div>
                  </div>
                </div>
              {:else}
                <div class="tour-hub">
                  <div class="tour-hub__head">
                    <div>
                      <p>{t('landing.mockup.documentTitle')}</p>
                      <span>{t('landing.tour.hubHint')}</span>
                    </div>
                    <strong>{t('landing.mockup.ready')}</strong>
                  </div>
                  <div class="tour-output-grid">
                    <div class="tour-output tour-output--summary">
                      <span>{t('landing.mockup.summaryReady')}</span>
                      <p>{t('landing.tour.summaryOutcome')}</p>
                    </div>
                    <div class="tour-output tour-output--flashcards">
                      <span>{t('landing.mockup.flashcardsReady')}</span>
                      <p>{t('landing.tour.flashcardsOutcome')}</p>
                    </div>
                    <div class="tour-output tour-output--exam">
                      <span>{t('landing.mockup.examReady')}</span>
                      <p>{t('landing.tour.examOutcome')}</p>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

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
    background: var(--ui-text-primary);
    color: var(--ui-bg-page);
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
    background: color-mix(in srgb, var(--ui-surface-card) 28%, var(--ui-bg-page));
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
  .lp-tour {
    position: relative;
    overflow: hidden;
    padding-block: clamp(5rem, 9vw, 9rem);
    background:
      linear-gradient(color-mix(in srgb, var(--ui-border-default) 48%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--ui-border-default) 48%, transparent) 1px, transparent 1px),
      radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--ui-accent-info) 16%, transparent), transparent 34rem),
      var(--ui-bg-page);
    background-size: auto, 7.5rem 7.5rem, auto, auto;
  }

  .lp-section-head--center {
    max-width: 44rem;
    margin-inline: auto;
    text-align: center;
  }

  .lp-section-sub {
    margin: 1rem auto 0;
    max-width: 38rem;
    color: var(--ui-text-secondary);
    font-size: 1rem;
    line-height: 1.7;
  }

  .tour-shell {
    position: relative;
    display: grid;
    gap: 1.25rem;
    max-width: 70rem;
    margin-inline: auto;
  }

  .tour-shell__rail {
    position: absolute;
    inset-block: 2rem;
    inset-inline-start: 2rem;
    width: 1px;
    background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--ui-accent-info) 75%, transparent), color-mix(in srgb, var(--ui-accent-success) 75%, transparent), color-mix(in srgb, var(--ui-accent-warning) 75%, transparent), transparent);
  }

  .tour-step {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(1.5rem, 4vw, 4rem);
    align-items: center;
    min-height: 24rem;
    padding: clamp(1.25rem, 3vw, 2rem);
    padding-inline-start: clamp(4.25rem, 6vw, 5.25rem);
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 76%, transparent);
    border-radius: 14px;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 42%, transparent), transparent 70%),
      rgba(5, 5, 5, 0.92);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .tour-step::before {
    content: "";
    position: absolute;
    inset-block-start: 2rem;
    inset-inline-start: calc(2rem - 0.42rem);
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 999px;
    background: var(--tour-accent);
    box-shadow: 0 0 0 0.35rem color-mix(in srgb, var(--tour-accent) 16%, transparent);
  }

  .tour-step--blue { --tour-accent: var(--ui-accent-info); --tour-surface: color-mix(in srgb, var(--ui-accent-info) 12%, transparent); }
  .tour-step--green { --tour-accent: var(--ui-accent-success); --tour-surface: color-mix(in srgb, var(--ui-accent-success) 12%, transparent); }
  .tour-step--amber { --tour-accent: var(--ui-accent-warning); --tour-surface: color-mix(in srgb, var(--ui-accent-warning) 13%, transparent); }

  .tour-step__copy {
    min-width: 0;
  }

  .tour-step__num {
    display: inline-flex;
    margin-bottom: 1rem;
    color: color-mix(in srgb, var(--tour-accent) 78%, #fff 22%);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.16em;
  }

  .tour-step__copy h3 {
    margin: 0 0 0.85rem;
    color: var(--ui-text-primary);
    font-size: clamp(1.6rem, 3vw, 2.35rem);
    font-weight: 850;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .tour-step__copy p:last-child {
    margin: 0;
    max-width: 31rem;
    color: var(--ui-text-secondary);
    font-size: 1rem;
    line-height: 1.75;
  }

  .tour-step__visual {
    min-width: 0;
  }

  .tour-upload,
  .tour-picker,
  .tour-hub {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 78%, transparent);
    border-radius: 12px;
    background:
      radial-gradient(circle at 12% 0%, var(--tour-surface), transparent 16rem),
      var(--ui-surface-secondary);
  }

  .tour-upload__drop,
  .tour-file,
  .tour-picker__head,
  .tour-hub__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--ui-border-default);
    border-radius: 10px;
    background: var(--ui-surface-card);
  }

  .tour-upload__drop {
    justify-content: flex-start;
    min-height: 9rem;
    border-style: dashed;
  }

  .tour-upload__icon,
  .tour-file > span {
    position: relative;
    display: inline-flex;
    width: 2.5rem;
    height: 2.5rem;
    flex: 0 0 auto;
    border-radius: 10px;
    background: var(--tour-surface);
    border: 1px solid color-mix(in srgb, var(--tour-accent) 35%, transparent);
  }

  .tour-upload__icon::before,
  .tour-file > span::before {
    content: "";
    position: absolute;
    inset: 0.72rem;
    border-block-start: 2px solid var(--tour-accent);
    border-inline-start: 2px solid var(--tour-accent);
    transform: rotate(45deg) translate(0.1rem, 0.1rem);
  }

  .tour-upload p,
  .tour-file p,
  .tour-picker__head p,
  .tour-hub__head p {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 0.98rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .tour-upload span,
  .tour-file small,
  .tour-picker__head span,
  .tour-hub__head span {
    color: var(--ui-text-secondary);
    font-size: 0.82rem;
    line-height: 1.45;
  }

  .tour-file strong,
  .tour-hub__head strong,
  .tour-tool span {
    flex: 0 0 auto;
    padding: 0.25rem 0.55rem;
    border: 1px solid color-mix(in srgb, var(--tour-accent) 34%, transparent);
    border-radius: 999px;
    background: var(--tour-surface);
    color: color-mix(in srgb, var(--tour-accent) 82%, #fff 18%);
    font-size: 0.68rem;
    font-weight: 800;
    line-height: 1.2;
  }

  .tour-tool-grid,
  .tour-output-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;
  }

  .tour-tool,
  .tour-output {
    display: grid;
    align-content: start;
    gap: 0.7rem;
    min-height: 11rem;
    padding: 1rem;
    border: 1px solid var(--ui-border-default);
    border-radius: 10px;
    background: var(--ui-surface-card);
  }

  /* Output cards: all green = "ready" state, matching the real app */
  .tour-output--summary,
  .tour-output--flashcards,
  .tour-output--exam { --tool-accent: var(--ui-accent-success); --tool-surface: color-mix(in srgb, var(--ui-accent-success) 12%, transparent); }

  .tour-tool strong,
  .tour-output span {
    color: var(--ui-text-primary);
    font-size: 0.92rem;
    font-weight: 800;
    line-height: 1.35;
  }

  .tour-tool p,
  .tour-output p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .tour-tool span {
    justify-self: start;
    margin-top: auto;
    border-color: color-mix(in srgb, var(--ui-accent-success) 36%, transparent);
    background: color-mix(in srgb, var(--ui-accent-success) 12%, transparent);
    color: color-mix(in srgb, var(--ui-accent-success) 80%, #fff 20%);
  }

  .tour-output {
    min-height: 8.5rem;
    border-color: color-mix(in srgb, var(--tool-accent) 24%, var(--ui-border-default) 76%);
    background: linear-gradient(180deg, var(--tool-surface), transparent 80%), var(--ui-surface-card);
  }

  .lp-faq {
    padding-block: clamp(5rem, 8vw, 8rem);
    border-top: 1px solid var(--ui-border-default);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 18%, transparent) 0%, transparent 40%),
      var(--ui-bg-page);
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
    border-top: 1px solid var(--ui-border-default);
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
    .tour-shell__rail {
      inset-inline-start: 1.25rem;
    }

    .tour-step {
      grid-template-columns: 1fr;
      padding-inline-start: 3.25rem;
    }

    .tour-step::before {
      inset-inline-start: calc(1.25rem - 0.42rem);
    }

    .tour-tool-grid,
    .tour-output-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .lp-hero__headline {
      font-size: clamp(2.45rem, 14vw, 3.35rem);
    }

    .tour-shell__rail {
      display: none;
    }

    .tour-step {
      padding: 1rem;
    }

    .tour-step::before {
      display: none;
    }

    .tour-upload__drop,
    .tour-file,
    .tour-picker__head,
    .tour-hub__head {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
