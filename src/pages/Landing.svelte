<script>
  import { tick } from 'svelte';
  import Badge from '../lib/components/ui/Badge.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import { LANDING_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../routes.js';
  import { currentPath, routeParams, router } from '../stores/router.js';

  const workflowSteps = [
    {
      title: 'Upload your source material',
      description: 'Add PDFs, DOCX files, or slide decks once, then keep the workflow anchored to the original document.'
    },
    {
      title: 'Generate study assets',
      description: 'Create summaries, flashcards, and exam prep from the same document instead of rebuilding context each time.'
    },
    {
      title: 'Study inside one hub',
      description: 'Open the canonical study flow under #/study and move between document views without losing your place.'
    }
  ];

  const featureCards = [
    {
      title: 'Document upload that leads somewhere',
      description: 'The product starts with your actual study files, not a blank chat box.'
    },
    {
      title: 'Summary generation for fast review',
      description: 'Turn long documents into readable high-signal summaries you can scan before class or exams.'
    },
    {
      title: 'Flashcards from the same source',
      description: 'Generate review prompts tied to the uploaded material so memorization stays grounded.'
    },
    {
      title: 'Exam prep in the same flow',
      description: 'Move from source document to questions and review without jumping across disconnected screens.'
    }
  ];

  const studyFlowPanels = [
    {
      label: 'Ingest',
      title: 'Upload and process',
      description: 'Bring in notes, lecture slides, or study guides and let Study Maxing structure the next step.'
    },
    {
      label: 'Generate',
      title: 'Build your study set',
      description: 'Create summaries, flashcards, and exam prep outputs from the same document record.'
    },
    {
      label: 'Review',
      title: 'Stay inside the study hub',
      description: 'Open the study route, switch modes, and keep the review loop compact and readable.'
    }
  ];

  const faqs = [
    {
      question: 'What does Study Maxing actually do today?',
      answer: 'It supports document upload plus generation of summaries, flashcards, and exam prep, all feeding into the study hub workflow.'
    },
    {
      question: 'Where does the main authenticated experience live?',
      answer: 'The canonical study workflow remains under #/study, with the landing and auth screens acting as the public entry surface.'
    },
    {
      question: 'Do I need separate tools for each output?',
      answer: 'No. The product is built around one document-to-study flow rather than isolated feature pages.'
    }
  ];

  let openFaq = 0;
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

  function goToSection(sectionId) {
    const target = `${LANDING_PATH}?section=${sectionId}`;
    if ($currentPath === LANDING_PATH) {
      router.replace(target);
      scrollToSection(sectionId);
      return;
    }

    router.navigate(target);
  }

  function toggleFaq(index) {
    openFaq = openFaq === index ? -1 : index;
  }
</script>

<main class="landing-page">
  <section class="hero-section section-shell">
    <div class="section-shell__inner hero-grid">
      <div class="hero-copy">
        <Badge tone="neutral" variant="soft" size="sm" className="hero-badge">Study Maxing</Badge>
        <h1>Study documents in one premium flow.</h1>
        <p class="hero-subtitle">
          Upload notes and course files, generate summaries, flashcards, and exam prep, then review everything through the real study workflow under <code>#/study</code>.
        </p>

        <div class="hero-actions">
          <Button variant="primary" size="lg" type="button" on:click={() => goTo(SIGN_UP_PATH)}>Get started</Button>
          <Button variant="secondary" size="lg" type="button" on:click={() => goToSection('how-it-works')}>See how it works</Button>
        </div>

        <div class="hero-pills">
          <span>PDF, DOCX, PPTX</span>
          <span>Summary + flashcards + exam prep</span>
          <span>Canonical study hub</span>
        </div>
      </div>

      <Card class="hero-card" variant="raised" padding="lg" border="subtle">
        <div class="hero-card__header">
          <div>
            <p class="hero-card__eyebrow">Live workflow</p>
            <h2>From upload to study-ready output</h2>
          </div>
          <span class="hero-card__badge">Fast</span>
        </div>

        <div class="hero-card__stack">
          <div class="workflow-row">
            <span class="workflow-row__label">Upload</span>
            <strong>Biology Midterm Pack.pdf</strong>
            <p>Document is processed once and becomes the anchor for the rest of the workflow.</p>
          </div>

          <div class="workflow-grid">
            <div class="workflow-tile">
              <span>Summary</span>
              <p>Readable recap for fast review before deeper practice.</p>
            </div>
            <div class="workflow-tile">
              <span>Flashcards</span>
              <p>Question-and-answer prompts based on the same source material.</p>
            </div>
            <div class="workflow-tile">
              <span>Exam prep</span>
              <p>Practice questions without leaving the document context.</p>
            </div>
            <div class="workflow-tile workflow-tile--accent">
              <span>Study hub</span>
              <p>Open the generated assets together inside the authenticated flow.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </section>

  <section id="features" class="section-shell">
    <div class="section-shell__inner">
      <div class="section-heading">
        <p class="section-eyebrow">Product story</p>
        <h2>Study Maxing matches the product you already have, not a generic AI landing page.</h2>
        <p>The public experience now mirrors the real app: document ingestion, generated study assets, and one clean review flow.</p>
      </div>

      <div class="feature-grid">
        {#each featureCards as feature}
          <Card class="feature-card" variant="base" padding="md" border="subtle" hoverable>
            <span class="feature-card__marker"></span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <section id="how-it-works" class="section-shell">
    <div class="section-shell__inner">
      <div class="section-heading">
        <p class="section-eyebrow">How it works</p>
        <h2>Three steps. One study workflow.</h2>
      </div>

      <div class="step-grid">
        {#each workflowSteps as step, index}
          <Card class="step-card" variant="base" padding="md" border="subtle">
            <span class="step-index">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <section id="study-flow" class="section-shell">
    <div class="section-shell__inner">
      <Card class="study-flow-card" variant="raised" padding="lg" border="subtle">
        <div class="study-flow-copy">
          <p class="section-eyebrow">Study flow</p>
          <h2>The core loop stays compact, readable, and tied to the source document.</h2>
          <p>
            Study Maxing is strongest when upload, summary generation, flashcards, and exam prep all feel like one system instead of four disconnected features.
          </p>
        </div>

        <div class="study-flow-grid">
          {#each studyFlowPanels as panel}
            <div class="study-flow-panel">
              <span class="study-flow-panel__label">{panel.label}</span>
              <strong>{panel.title}</strong>
              <p>{panel.description}</p>
            </div>
          {/each}
        </div>
      </Card>
    </div>
  </section>

  <section id="faq" class="section-shell">
    <div class="section-shell__inner section-shell__inner--narrow">
      <div class="section-heading section-heading--center">
        <p class="section-eyebrow">Trust and FAQ</p>
        <h2>Clear expectations for the public surface</h2>
        <p>Keep the story concise, accurate, and easy to verify once a user signs in.</p>
      </div>

      <div class="faq-list">
        {#each faqs as item, index}
          <Card class="faq-card" variant="base" padding="none" border="subtle">
            <button type="button" class="faq-trigger" aria-expanded={openFaq === index} on:click={() => toggleFaq(index)}>
              <span>{item.question}</span>
              <span class="faq-trigger__icon">{openFaq === index ? '−' : '+'}</span>
            </button>

            {#if openFaq === index}
              <div class="faq-content">
                <p>{item.answer}</p>
              </div>
            {/if}
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <section class="section-shell">
    <div class="section-shell__inner">
      <Card class="final-cta" variant="raised" padding="lg" border="subtle">
        <div>
          <p class="section-eyebrow">Get started</p>
          <h2>Bring upload, review, and exam prep into one polished flow.</h2>
          <p>Sign up to start the authenticated study experience, or sign in to jump straight back into your documents.</p>
        </div>

        <div class="hero-actions">
          <Button variant="primary" size="lg" type="button" on:click={() => goTo(SIGN_UP_PATH)}>Get started</Button>
          <Button variant="secondary" size="lg" type="button" on:click={() => goTo(SIGN_IN_PATH)}>Sign in</Button>
        </div>
      </Card>
    </div>
  </section>
</main>

<style>
  .landing-page {
    display: grid;
    background: var(--ui-bg-page);
    color: var(--ui-text-primary);
  }

  .section-shell {
    border-bottom: 1px solid color-mix(in srgb, var(--ui-border-default) 92%, transparent);
  }

  .section-shell__inner {
    width: min(var(--size-content), calc(100% - 32px));
    margin: 0 auto;
    padding: clamp(3rem, 7vw, 5.5rem) 0;
  }

  .section-shell__inner--narrow {
    width: min(860px, calc(100% - 32px));
  }

  .hero-section {
    position: relative;
    overflow: clip;
  }

  .hero-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top left, color-mix(in srgb, var(--ui-text-primary) 12%, transparent), transparent 38%),
      radial-gradient(circle at 88% 16%, color-mix(in srgb, var(--ui-text-primary) 7%, transparent), transparent 28%);
    pointer-events: none;
  }

  .hero-grid {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.03fr) minmax(0, 0.97fr);
    gap: clamp(1.5rem, 4vw, 3rem);
    align-items: center;
  }

  .hero-copy {
    display: grid;
    gap: 1.25rem;
  }

  :global(.hero-badge) {
    width: fit-content;
  }

  .hero-copy h1,
  .hero-copy p,
  .hero-pills,
  .hero-card h2,
  .hero-card p {
    margin: 0;
  }

  .hero-copy h1 {
    max-width: 10ch;
    font-size: clamp(3rem, 8vw, 5.75rem);
    line-height: 0.92;
    letter-spacing: -0.08em;
  }

  .hero-subtitle {
    max-width: 54ch;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-lg);
    line-height: 1.7;
  }

  .hero-subtitle code {
    display: inline-flex;
    align-items: center;
    min-height: 1.8rem;
    padding: 0 0.45rem;
    border-radius: var(--ui-radius-xs);
    background: color-mix(in srgb, var(--ui-surface-secondary) 72%, transparent);
    color: var(--ui-text-primary);
    font-size: 0.95em;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
  }

  .hero-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .hero-pills span {
    display: inline-flex;
    align-items: center;
    min-height: 2.1rem;
    padding: 0 0.9rem;
    border-radius: var(--ui-radius-pill);
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 92%, transparent);
    background: color-mix(in srgb, var(--ui-surface-card) 82%, transparent);
    color: var(--ui-text-primary);
    font-size: var(--ui-type-label);
    font-weight: 600;
  }

  :global(.hero-card) {
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 90%, transparent), color-mix(in srgb, var(--ui-surface-secondary) 72%, var(--ui-surface-card) 28%));
  }

  .hero-card__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
  }

  .hero-card__eyebrow,
  .workflow-row p,
  .workflow-tile p,
  .section-heading p,
  .study-flow-copy p,
  .study-flow-panel p,
  .faq-content p {
    margin: 0;
  }

  .hero-card__eyebrow,
  .section-eyebrow {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .hero-card h2,
  .section-heading h2,
  .study-flow-copy h2,
  .final-cta h2 {
    margin: 0.35rem 0 0;
    color: var(--ui-text-primary);
    font-size: clamp(1.85rem, 4vw, 3rem);
    letter-spacing: -0.05em;
    line-height: 1.05;
  }

  .hero-card__badge {
    display: inline-flex;
    align-items: center;
    min-height: 2rem;
    padding: 0 0.75rem;
    border-radius: var(--ui-radius-pill);
    background: color-mix(in srgb, var(--ui-accent-solid) 14%, var(--ui-surface-secondary) 86%);
    color: var(--ui-text-primary);
    font-size: var(--ui-type-label);
    font-weight: 700;
  }

  .hero-card__stack,
  .workflow-grid,
  .feature-grid,
  .step-grid,
  .study-flow-grid,
  .faq-list {
    display: grid;
    gap: 1rem;
  }

  .workflow-row,
  .workflow-tile,
  .study-flow-panel {
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 92%, transparent);
    border-radius: calc(var(--ui-radius-md) + 4px);
    background: color-mix(in srgb, var(--ui-surface-card) 88%, transparent);
  }

  .workflow-row {
    padding: 1rem 1.05rem;
    display: grid;
    gap: 0.45rem;
  }

  .workflow-row__label,
  .study-flow-panel__label,
  .step-index {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .workflow-row strong,
  .workflow-tile span,
  .feature-card h3,
  .step-card h3,
  .study-flow-panel strong {
    color: var(--ui-text-primary);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .workflow-row p,
  .workflow-tile p,
  .feature-card p,
  .step-card p,
  .study-flow-panel p,
  .section-heading p,
  .study-flow-copy p,
  .faq-content p,
  .final-cta p {
    color: var(--ui-text-secondary);
    line-height: 1.65;
    font-size: var(--ui-type-body-sm);
  }

  .workflow-grid,
  .feature-grid,
  .study-flow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workflow-tile,
  .study-flow-panel {
    padding: 1rem;
    display: grid;
    gap: 0.4rem;
  }

  .workflow-tile--accent {
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-secondary) 62%, transparent), color-mix(in srgb, var(--ui-surface-card) 92%, transparent));
  }

  .section-heading,
  .section-heading--center,
  .study-flow-copy,
  .final-cta {
    display: grid;
    gap: 0.75rem;
  }

  .section-heading {
    margin-bottom: 1.4rem;
  }

  .section-heading--center {
    text-align: center;
  }

  :global(.feature-card),
  :global(.step-card),
  :global(.faq-card),
  :global(.study-flow-card),
  :global(.final-cta) {
    background: color-mix(in srgb, var(--ui-surface-card) 94%, transparent);
  }

  .feature-card,
  .step-card {
    display: grid;
    gap: 0.75rem;
    min-height: 100%;
  }

  .feature-card__marker {
    width: 2.5rem;
    height: 0.35rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--ui-accent-solid) 55%, var(--ui-surface-secondary) 45%);
  }

  .feature-card h3,
  .step-card h3 {
    margin: 0;
  }

  .step-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .study-flow-card {
    display: grid;
    gap: 1.5rem;
  }

  .faq-trigger {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border: 0;
    background: transparent;
    color: var(--ui-text-primary);
    padding: 1rem 1.1rem;
    font: inherit;
    font-size: var(--ui-type-body-md);
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }

  .faq-trigger__icon {
    color: var(--ui-text-muted);
    font-size: 1.3rem;
    line-height: 1;
  }

  .faq-content {
    padding: 0 1.1rem 1rem;
  }

  .final-cta {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 1rem;
  }

  @media (max-width: 960px) {
    .hero-grid,
    .final-cta,
    .step-grid,
    .workflow-grid,
    .feature-grid,
    .study-flow-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .section-shell__inner,
    .section-shell__inner--narrow {
      width: min(100% - 24px, var(--size-content));
    }

    .hero-copy h1 {
      max-width: none;
    }

    .hero-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
