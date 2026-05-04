<script>
  import { tick } from 'svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import { LANDING_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../routes.js';
  import { currentPath, routeParams, router } from '../stores/router.js';

  const workflowSteps = [
    {
      step: '01',
      title: 'Upload your file',
      description:
        'Add a PDF, DOCX, or PPTX up to 25 MB. One document becomes the anchor for all three study tools.'
    },
    {
      step: '02',
      title: 'Choose what to generate',
      description:
        'Pick a summary, a flashcard set, a 10-question practice exam — or all three at once.'
    },
    {
      step: '03',
      title: 'Study in the Hub',
      description:
        'Your document, summary, flashcards, and exam live together in the Study Hub — organized and always in context.'
    }
  ];

  const featureCards = [
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      title: 'AI summaries',
      description:
        'Reads your document and produces a structured summary of key concepts. Tied to your actual content — not generic.'
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
      title: 'Flashcard sets',
      description:
        'Generates question-and-answer cards directly from your uploaded document. The same source, in a format built for memorization.'
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      title: 'Practice exams',
      description:
        'Creates 10 multiple-choice and true/false questions from your content. Exam-style, document-grounded.'
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
      title: 'Study Hub',
      description:
        'Every document you upload, and every tool generated from it, lives in one organized library. Open any document to jump back in.'
    }
  ];

  const trustItems = [
    'PDF · DOCX · PPTX',
    'Free during early access',
    'English + Arabic',
    'No credit card'
  ];

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

<main class="landing-page">

  <!-- ── HERO ─────────────────────────────────────── -->
  <section class="hero-section section-shell">
    <div class="section-shell__inner hero-grid">

      <div class="hero-copy landing-enter">
        <p class="eyebrow-label">EARLY ACCESS — FREE</p>
        <h1>Turn any study document into summaries, flashcards, and a practice exam.</h1>
        <p class="hero-subtitle">
          Upload a PDF, DOCX, or PPTX. StudyMaxing reads it and generates three study tools
          anchored to your document — instantly. No credit card required.
        </p>
        <div class="hero-actions">
          <Button variant="primary" size="lg" type="button" on:click={() => goTo(SIGN_UP_PATH)}>
            Get started free
          </Button>
          <Button variant="ghost" size="lg" type="button" on:click={() => goTo(SIGN_IN_PATH)}>
            Sign in
          </Button>
        </div>
      </div>

      <!-- product mockup -->
      <div class="hero-mockup landing-enter landing-enter--delay" aria-hidden="true">
        <div class="mockup-frame">
          <div class="mockup-chrome">
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
            <span class="mockup-url">studymaxing.com/study/bio-midterm</span>
          </div>
          <div class="mockup-app">
            <div class="mockup-sidebar">
              <div class="mockup-brand">StudyMaxing</div>
              <nav class="mockup-nav">
                <div class="mockup-nav-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <span>Home</span>
                </div>
                <div class="mockup-nav-item mockup-nav-item--active">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>Library</span>
                </div>
                <div class="mockup-nav-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                  <span>Settings</span>
                </div>
              </nav>
            </div>
            <div class="mockup-main">
              <div class="mockup-doc-header">
                <div class="mockup-doc-title">Biology Midterm Pack</div>
                <div class="mockup-status-badge">Complete</div>
              </div>
              <div class="mockup-tabs">
                <div class="mockup-tab mockup-tab--active">Summary</div>
                <div class="mockup-tab">Flashcards</div>
                <div class="mockup-tab">Mock Exam</div>
              </div>
              <div class="mockup-content">
                <div class="mockup-summary-block">
                  <div class="mockup-summary-label">Key concepts</div>
                  <div class="mockup-text-line mockup-text-line--full"></div>
                  <div class="mockup-text-line mockup-text-line--wide"></div>
                  <div class="mockup-text-line mockup-text-line--med"></div>
                </div>
                <div class="mockup-summary-block">
                  <div class="mockup-summary-label">Main arguments</div>
                  <div class="mockup-text-line mockup-text-line--full"></div>
                  <div class="mockup-text-line mockup-text-line--narrow"></div>
                </div>
                <div class="mockup-card-row">
                  <div class="mockup-mini-card">
                    <div class="mockup-mini-card__label">Flashcards</div>
                    <div class="mockup-mini-card__val">24 cards</div>
                  </div>
                  <div class="mockup-mini-card">
                    <div class="mockup-mini-card__label">Exam questions</div>
                    <div class="mockup-mini-card__val">10 questions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- ── TRUST STRIP ─────────────────────────────── -->
  <section class="trust-strip section-shell">
    <div class="section-shell__inner trust-inner">
      {#each trustItems as item}
        <span class="trust-pill">{item}</span>
      {/each}
    </div>
  </section>

  <!-- ── HOW IT WORKS ────────────────────────────── -->
  <section id="how-it-works" class="how-section section-shell">
    <div class="section-shell__inner">
      <div class="section-heading">
        <p class="eyebrow-label">HOW IT WORKS</p>
        <h2>Three steps from document to exam-ready.</h2>
        <p class="section-subtitle">Upload once, choose your outputs, study everything from one place.</p>
      </div>

      <div class="steps-grid">
        {#each workflowSteps as step}
          <div class="step-card">
            <span class="step-num">{step.step}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── FEATURES ────────────────────────────────── -->
  <section id="features" class="features-section section-shell">
    <div class="section-shell__inner">
      <div class="section-heading">
        <p class="eyebrow-label">WHAT YOU GET</p>
        <h2>Every study tool your document can generate.</h2>
        <p class="section-subtitle">Four outputs, one upload. All of them anchored to the file you uploaded.</p>
      </div>

      <div class="features-grid">
        {#each featureCards as card}
          <div class="feature-card">
            <div class="feature-card__icon" aria-hidden="true">
              {@html card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── FINAL CTA ───────────────────────────────── -->
  <section class="cta-section section-shell">
    <div class="section-shell__inner cta-inner">
      <p class="eyebrow-label">GET STARTED</p>
      <h2>Free during early access. Start studying in minutes.</h2>
      <p class="cta-body">
        Upload your first document and see what StudyMaxing generates.
        No credit card, no commitment.
      </p>
      <div class="hero-actions">
        <Button variant="primary" size="lg" type="button" on:click={() => goTo(SIGN_UP_PATH)}>
          Get started free
        </Button>
        <Button variant="ghost" size="lg" type="button" on:click={() => goTo(SIGN_IN_PATH)}>
          Sign in
        </Button>
      </div>
    </div>
  </section>

</main>

<style>
  /* ── Shell ────────────────────────────────────── */
  .landing-page {
    display: grid;
    min-height: 100%;
  }

  .section-shell {
    padding-block: clamp(4rem, 6vw, 7rem);
  }

  .section-shell__inner {
    width: min(var(--size-content, 74rem), calc(100% - 3rem));
    margin-inline: auto;
  }

  /* ── Entrance animation ──────────────────────── */
  .landing-enter {
    animation: landing-fade-up 420ms cubic-bezier(0.2, 0, 0.2, 1) both;
  }

  .landing-enter--delay {
    animation-delay: 80ms;
  }

  @keyframes landing-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Shared type ─────────────────────────────── */
  .eyebrow-label {
    margin: 0 0 1rem;
    color: var(--ui-text-muted);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .section-heading {
    max-width: 36rem;
    margin-bottom: clamp(2.5rem, 4vw, 4rem);
  }

  .section-heading h2 {
    margin: 0 0 0.75rem;
    color: var(--ui-text-primary);
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1.1;
  }

  .section-subtitle {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 1rem;
    line-height: 1.6;
  }

  /* ── Hero ────────────────────────────────────── */
  .hero-section {
    position: relative;
    overflow: hidden;
    padding-block: clamp(4.5rem, 8vw, 9rem);
    background:
      radial-gradient(ellipse at 60% -20%, color-mix(in srgb, var(--ui-text-primary) 5%, transparent) 0%, transparent 55%),
      var(--ui-bg-page);
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2.5rem, 4vw, 5rem);
    align-items: center;
  }

  .hero-copy {
    display: grid;
    gap: 0;
  }

  .hero-copy h1 {
    margin: 0 0 1.25rem;
    color: var(--ui-text-primary);
    font-size: clamp(2rem, 4vw, 3.25rem);
    font-weight: 800;
    letter-spacing: -0.055em;
    line-height: 1.05;
  }

  .hero-subtitle {
    margin: 0 0 2rem;
    color: var(--ui-text-secondary);
    font-size: clamp(1rem, 1.5vw, 1.125rem);
    line-height: 1.65;
    max-width: 38rem;
  }

  .hero-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  /* ── Product mockup ──────────────────────────── */
  .hero-mockup {
    min-width: 0;
  }

  .mockup-frame {
    border-radius: var(--ui-radius-lg, 1rem);
    border: 1px solid var(--ui-border-default, #2a2a2a);
    background: #0a0a0a;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  }

  .mockup-chrome {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.875rem;
    border-bottom: 1px solid #1f1f1f;
    background: #111111;
  }

  .mockup-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #2a2a2a;
  }

  .mockup-url {
    margin-left: 0.5rem;
    color: #525252;
    font-size: 0.65rem;
    font-family: var(--font-family-mono, monospace);
    letter-spacing: 0;
  }

  .mockup-app {
    display: grid;
    grid-template-columns: 10rem 1fr;
    min-height: 320px;
  }

  .mockup-sidebar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.875rem 0.75rem;
    border-right: 1px solid #1f1f1f;
    background: #0d0d0d;
  }

  .mockup-brand {
    padding: 0 0.375rem 0.625rem;
    border-bottom: 1px solid #1f1f1f;
    color: #fafafa;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 0.25rem;
  }

  .mockup-nav {
    display: grid;
    gap: 0.125rem;
  }

  .mockup-nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    border-radius: 0.375rem;
    color: #525252;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .mockup-nav-item--active {
    background: rgba(255,255,255,0.07);
    color: #fafafa;
  }

  .mockup-main {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: #111111;
  }

  .mockup-doc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #1f1f1f;
  }

  .mockup-doc-title {
    color: #fafafa;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .mockup-status-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    border: 1px solid rgba(34,197,94,0.25);
    background: rgba(34,197,94,0.1);
    color: #22c55e;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .mockup-tabs {
    display: flex;
    gap: 0;
    padding: 0 0.875rem;
    border-bottom: 1px solid #1f1f1f;
  }

  .mockup-tab {
    padding: 0.5rem 0.75rem;
    border-bottom: 1.5px solid transparent;
    color: #525252;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: default;
  }

  .mockup-tab--active {
    border-bottom-color: #fafafa;
    color: #fafafa;
  }

  .mockup-content {
    display: grid;
    gap: 0.875rem;
    padding: 0.875rem;
    flex: 1;
  }

  .mockup-summary-block {
    display: grid;
    gap: 0.3rem;
  }

  .mockup-summary-label {
    color: #525252;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.1rem;
  }

  .mockup-text-line {
    height: 0.5rem;
    border-radius: 999px;
    background: #1f1f1f;
  }

  .mockup-text-line--full  { width: 100%; }
  .mockup-text-line--wide  { width: 82%; }
  .mockup-text-line--med   { width: 64%; }
  .mockup-text-line--narrow { width: 48%; }

  .mockup-card-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .mockup-mini-card {
    display: grid;
    gap: 0.2rem;
    padding: 0.5rem 0.625rem;
    border-radius: 0.4rem;
    border: 1px solid #1f1f1f;
    background: #171717;
  }

  .mockup-mini-card__label {
    color: #525252;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .mockup-mini-card__val {
    color: #fafafa;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  /* ── Trust strip ─────────────────────────────── */
  .trust-strip {
    padding-block: 1.5rem;
    border-block: 1px solid color-mix(in srgb, var(--ui-border-default) 60%, transparent);
    background: color-mix(in srgb, var(--ui-surface-card) 40%, transparent);
  }

  .trust-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .trust-pill {
    padding: 0.375rem 0.875rem;
    border-radius: var(--ui-radius-pill, 999px);
    border: 1px solid var(--ui-border-default, #2a2a2a);
    background: color-mix(in srgb, var(--ui-surface-secondary) 50%, transparent);
    color: var(--ui-text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: -0.005em;
    white-space: nowrap;
  }

  /* ── How it works ────────────────────────────── */
  .how-section {
    background:
      radial-gradient(ellipse at 0% 50%, color-mix(in srgb, var(--ui-text-primary) 3%, transparent) 0%, transparent 50%),
      var(--ui-bg-page);
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
  }

  .step-card {
    display: grid;
    gap: 0.75rem;
    padding: 1.75rem;
    border-radius: var(--ui-radius-lg, 1rem);
    border: 1px solid var(--ui-border-default, #2a2a2a);
    background: var(--ui-surface-card, #111111);
  }

  .step-num {
    display: inline-flex;
    width: 2rem;
    height: 2rem;
    align-items: center;
    justify-content: center;
    border-radius: var(--ui-radius-sm, 0.5rem);
    border: 1px solid var(--ui-border-default, #2a2a2a);
    background: color-mix(in srgb, var(--ui-surface-secondary) 60%, transparent);
    color: var(--ui-text-muted);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .step-card h3 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .step-card p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  /* ── Features ────────────────────────────────── */
  .features-section {
    background: color-mix(in srgb, var(--ui-surface-card) 30%, var(--ui-bg-page) 70%);
    border-block: 1px solid color-mix(in srgb, var(--ui-border-default) 60%, transparent);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .feature-card {
    display: grid;
    gap: 0.75rem;
    padding: 1.75rem;
    border-radius: var(--ui-radius-lg, 1rem);
    border: 1px solid var(--ui-border-default, #2a2a2a);
    background: var(--ui-surface-card, #111111);
    transition: border-color 160ms var(--ease-standard, cubic-bezier(0.2,0,0.2,1));
  }

  .feature-card:hover {
    border-color: var(--ui-border-strong, #3f3f3f);
  }

  .feature-card__icon {
    display: inline-flex;
    width: 2.25rem;
    height: 2.25rem;
    align-items: center;
    justify-content: center;
    border-radius: var(--ui-radius-md, 0.75rem);
    border: 1px solid var(--ui-border-default, #2a2a2a);
    background: var(--ui-surface-secondary, #171717);
    color: var(--ui-text-secondary);
  }

  .feature-card h3 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .feature-card p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  /* ── Final CTA ───────────────────────────────── */
  .cta-section {
    background:
      radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--ui-text-primary) 4%, transparent) 0%, transparent 60%),
      var(--ui-bg-page);
  }

  .cta-inner {
    display: grid;
    gap: 1rem;
    max-width: 44rem;
    text-align: center;
    justify-items: center;
  }

  .cta-inner h2 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 800;
    letter-spacing: -0.05em;
    line-height: 1.1;
  }

  .cta-body {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 1rem;
    line-height: 1.65;
    max-width: 34rem;
  }

  /* ── Responsive ──────────────────────────────── */
  @media (max-width: 960px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }

    .hero-mockup {
      order: -1;
    }

    .mockup-app {
      grid-template-columns: 8rem 1fr;
      min-height: 260px;
    }

    .steps-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .section-shell__inner {
      width: min(100% - 1.5rem, var(--size-content, 74rem));
    }

    .hero-actions {
      flex-direction: column;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .mockup-sidebar {
      display: none;
    }

    .mockup-app {
      grid-template-columns: 1fr;
    }

    .cta-inner {
      text-align: start;
      justify-items: start;
    }
  }

  @media (max-width: 480px) {
    .trust-inner {
      justify-content: flex-start;
    }

    .mockup-frame {
      display: none;
    }

    .hero-copy h1 {
      font-size: 1.85rem;
    }
  }
</style>
