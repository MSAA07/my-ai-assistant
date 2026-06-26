<script>
  import { Check, ClipboardCheck, FileText, Layers3 } from '@lucide/svelte';
  import { tick } from 'svelte';
  import { t } from '../lib/i18n/t.js';
  import { LANDING_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../routes.js';
  import { currentPath, routeParams, router } from '../stores/router.js';

  const tourSteps = [
    { num: '01', eyebrow: 'landing.tour.step1Eyebrow', title: 'landing.tour.step1Title', body: 'landing.tour.step1Body' },
    { num: '02', eyebrow: 'landing.tour.step2Eyebrow', title: 'landing.tour.step2Title', body: 'landing.tour.step2Body' },
    { num: '03', eyebrow: 'landing.tour.step3Eyebrow', title: 'landing.tour.step3Title', body: 'landing.tour.step3Body' }
  ];

  const faqs = [
    { q: 'landing.faq1Q', a: 'landing.faq1A' },
    { q: 'landing.faq2Q', a: 'landing.faq2A' },
    { q: 'landing.faq3Q', a: 'landing.faq3A' },
    { q: 'landing.faq4Q', a: 'landing.faq4A' },
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
        <h1 class="lp-hero__headline">
          <span>{t('landing.heroHeadline1')}</span>
          <span>{t('landing.heroHeadline2')}</span>
          <span>{t('landing.heroHeadline3')}</span>
        </h1>
        <p class="lp-hero__sub">{t('landing.heroSub')}</p>
        <button class="lp-btn lp-btn--primary" type="button" on:click={() => goTo(SIGN_UP_PATH)}>
          {t('landing.heroCta')}
        </button>
      </div>

    </div>
  </section>

  <!-- ── 2 · CREDIBILITY STRIP ────────────────────── -->
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
          <article class="tour-step">
            <span class="tour-step__marker" aria-hidden="true">{step.num}</span>
            <div class="tour-step__copy">
              <p class="lp-eyebrow">{t(step.eyebrow)}</p>
              <h3>{t(step.title)}</h3>
              <p>{t(step.body)}</p>
            </div>

            <div class="tour-step__visual" aria-hidden="true">
              {#if i === 0}
                <div class="tour-mockup tour-upload-mockup">
                  <div class="tour-upload-zone">
                    <div class="tour-mockup-icon tour-mockup-icon--large">
                      <FileText size={26} strokeWidth={1.8} />
                    </div>
                    <p>Drop your PDF, DOCX, or PPTX here</p>
                  </div>
                  <div class="tour-file-row">
                    <div class="tour-file-row__icon">
                      <FileText size={18} strokeWidth={1.8} />
                    </div>
                    <p>Biology Midterm.pdf &middot; 4.2 MB &middot; Ready</p>
                    <Check class="tour-file-row__check" size={18} strokeWidth={2.4} />
                  </div>
                </div>
              {:else if i === 1}
                <div class="tour-mockup tour-choice-mockup">
                  <div class="tour-choice-grid">
                    <div class="tour-choice-card">
                      <div class="tour-mockup-icon">
                        <FileText size={18} strokeWidth={1.8} />
                      </div>
                      <strong>Summary</strong>
                      <p>Condensed notes from the source file.</p>
                    </div>
                    <div class="tour-choice-card tour-choice-card--selected">
                      <div class="tour-mockup-icon">
                        <Layers3 size={18} strokeWidth={1.8} />
                      </div>
                      <strong>Flashcards</strong>
                      <p>Active recall cards for key terms.</p>
                    </div>
                    <div class="tour-choice-card">
                      <div class="tour-mockup-icon">
                        <ClipboardCheck size={18} strokeWidth={1.8} />
                      </div>
                      <strong>Mock Exam</strong>
                      <p>Practice questions with answer checks.</p>
                    </div>
                  </div>
                  <button class="tour-generate-button" type="button" tabindex="-1">Generate</button>
                </div>
              {:else}
                <div class="tour-mockup tour-study-mockup">
                  <div class="tour-tabs">
                    <span class="tour-tab tour-tab--active">Summary</span>
                    <span class="tour-tab">Flashcards</span>
                    <span class="tour-tab">Exam</span>
                  </div>
                  <div class="tour-summary-panel">
                    <h4>Biology Midterm</h4>
                    <ul>
                      <li>Cell membranes use phospholipid bilayers to control what enters and leaves the cell.</li>
                      <li>Mitochondria convert glucose into ATP through cellular respiration.</li>
                      <li>DNA in the nucleus stores instructions for protein synthesis and cell division.</li>
                    </ul>
                  </div>
                  <div class="tour-stat-row">
                    <span>24 flashcards ready</span>
                    <span>10 exam questions ready</span>
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
      radial-gradient(60% 80% at 100% 0%, color-mix(in srgb, var(--ui-text-primary) 4%, transparent), transparent),
      var(--ui-bg-page);
  }

  .lp-hero__grid {
    display: block;
    max-width: 48rem;
    text-align: center;
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


  /* ── 3 · Problem ───────────────────────────────── */
  .lp-problem {
    padding-block: clamp(5rem, 9vw, 9rem);
    border-top: 1px solid var(--ui-border-default);
    background: var(--ui-bg-page);
  }

  .lp-problem__inner {
    max-width: 52rem;
    margin-inline: auto;
    text-align: center;
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
    margin-inline: auto;
    color: var(--ui-text-secondary);
    font-size: 1rem;
    line-height: 1.8;
  }

  /* ── 4 · Features ──────────────────────────────── */
  .lp-tour {
    padding-block: clamp(5rem, 9vw, 9rem);
    border-top: 1px solid var(--ui-border-default);
    background: var(--ui-bg-page);
  }

  .lp-tour > .lp-container {
    max-width: min(92rem, 100%);
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
    gap: 0;
    max-width: 88rem;
    margin-inline: auto;
  }

  .tour-shell__rail {
    position: absolute;
    inset-block: clamp(3rem, 7vw, 5rem);
    inset-inline-start: 1.35rem;
    width: 1px;
    background: var(--ui-border-default);
  }

  .tour-step {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(2rem, 5vw, 5rem);
    align-items: center;
    min-height: 25rem;
    padding: clamp(3rem, 7vw, 5rem) 0 clamp(3rem, 7vw, 5rem) clamp(5rem, 7vw, 6rem);
  }

  .tour-step + .tour-step {
    border-top: 1px solid var(--ui-border-default);
  }

  .tour-step__marker {
    position: absolute;
    inset-block-start: clamp(3rem, 7vw, 5rem);
    inset-inline-start: 0;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid var(--ui-border-strong);
    border-radius: var(--ui-radius-pill);
    background: var(--ui-surface-card);
    color: var(--ui-text-primary);
    box-shadow: var(--ui-shadow-1);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .tour-step__copy {
    min-width: 0;
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

  .tour-mockup {
    display: grid;
    gap: var(--ui-space-4);
    padding: var(--ui-space-4);
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-lg);
    background: color-mix(in srgb, var(--ui-surface-card) 96%, transparent);
    box-shadow: var(--ui-shadow-2);
  }

  .tour-mockup-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-surface-secondary);
    color: var(--ui-text-primary);
  }

  .tour-mockup-icon--large {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: var(--ui-radius-md);
  }

  .tour-mockup-icon :global(svg) {
    display: block;
  }

  .tour-upload-zone {
    display: grid;
    min-height: 14rem;
    place-items: center;
    gap: var(--ui-space-3);
    padding: var(--ui-space-6);
    border: 1px dashed var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 44%, transparent);
    text-align: center;
  }

  .tour-upload-zone p {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 600;
    line-height: 1.45;
  }

  .tour-file-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-space-3);
    min-height: 4rem;
    padding: var(--ui-space-3) var(--ui-space-4);
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: var(--upload-file-row-bg);
  }

  .tour-file-row__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--ui-radius-sm);
    background: var(--ui-surface-secondary);
    color: var(--ui-text-muted);
  }

  .tour-file-row__icon :global(svg) {
    display: block;
  }

  .tour-file-row p {
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ui-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  :global(.tour-file-row__check) {
    color: var(--ui-accent-success);
  }

  .tour-choice-mockup {
    align-content: start;
  }

  .tour-choice-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ui-space-3);
  }

  .tour-choice-card {
    display: grid;
    align-content: start;
    gap: var(--ui-space-2);
    min-height: 10rem;
    padding: var(--ui-space-4);
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: var(--ui-surface-secondary);
    box-shadow: var(--ui-shadow-1);
  }

  .tour-choice-card--selected {
    border-color: var(--ui-border-strong);
    background: color-mix(in srgb, var(--ui-surface-secondary) 72%, var(--ui-text-primary) 8%);
    box-shadow: var(--ui-focus-ring);
  }

  .tour-choice-card strong {
    color: var(--ui-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 700;
    line-height: 1.3;
  }

  .tour-choice-card p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }

  .tour-generate-button {
    justify-self: start;
    min-height: 2.75rem;
    padding-inline: var(--ui-space-5);
    border: 1px solid transparent;
    border-radius: var(--ui-radius-sm);
    background: var(--ui-text-primary);
    color: var(--ui-bg-page);
    box-shadow: var(--ui-shadow-1);
    font: inherit;
    font-size: var(--font-size-sm);
    font-weight: 700;
  }

  .tour-study-mockup {
    gap: 0;
    overflow: hidden;
    padding: 0;
  }

  .tour-tabs {
    display: flex;
    gap: var(--ui-space-1);
    padding: var(--ui-space-3);
    border-bottom: 1px solid var(--ui-border-default);
    background: color-mix(in srgb, var(--ui-surface-secondary) 58%, transparent);
  }

  .tour-tab {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding-inline: var(--ui-space-3);
    border: 1px solid transparent;
    border-radius: var(--ui-radius-sm);
    color: var(--ui-text-muted);
    font-size: var(--font-size-xs);
    font-weight: 700;
  }

  .tour-tab--active {
    border-color: var(--ui-border-strong);
    background: var(--ui-surface-card);
    color: var(--ui-text-primary);
    box-shadow: var(--ui-shadow-1);
  }

  .tour-summary-panel {
    display: grid;
    gap: var(--ui-space-3);
    padding: var(--ui-space-5);
  }

  .tour-summary-panel h4 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(1.15rem, 1vw, 1.35rem);
    font-weight: 800;
    line-height: 1.2;
  }

  .tour-summary-panel ul {
    display: grid;
    gap: var(--ui-space-2);
    margin: 0;
    padding-inline-start: 1.1rem;
    color: var(--ui-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }

  .tour-summary-panel li::marker {
    color: var(--ui-text-primary);
  }

  .tour-stat-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-2);
    padding: 0 var(--ui-space-5) var(--ui-space-5);
  }

  .tour-stat-row span {
    display: inline-flex;
    align-items: center;
    min-height: 2rem;
    padding-inline: var(--ui-space-3);
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-pill);
    background: var(--ui-surface-secondary);
    color: var(--ui-text-primary);
    font-size: var(--font-size-xs);
    font-weight: 700;
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

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 900px) {
    .tour-shell__rail {
      inset-inline-start: 1.25rem;
    }

    .tour-step {
      grid-template-columns: 1fr;
      min-height: auto;
      padding-inline-start: 4rem;
    }

    .tour-step__copy h3 {
      font-size: clamp(1.4rem, 3vw, 1.9rem);
    }
  }

  @media (max-width: 640px) {
    .lp-hero__headline {
      font-size: clamp(2.45rem, 14vw, 3.35rem);
    }

    .tour-shell__rail {
      inset-inline-start: 1.1rem;
    }

    .tour-step {
      padding-block: var(--ui-space-7);
      padding-inline-start: 3.25rem;
    }

    .tour-step__marker {
      width: 2.25rem;
      height: 2.25rem;
      font-size: 0.68rem;
    }

    .tour-mockup {
      padding: var(--ui-space-3);
    }

    .tour-upload-zone {
      min-height: 12rem;
      padding: var(--ui-space-5);
    }

    .tour-choice-grid {
      grid-template-columns: 1fr;
    }

    .tour-tabs {
      overflow-x: auto;
    }

    .tour-summary-panel,
    .tour-stat-row {
      padding-inline: var(--ui-space-4);
    }
  }
</style>
