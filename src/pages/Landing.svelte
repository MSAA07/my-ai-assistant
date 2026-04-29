<script>
  import { tick } from 'svelte';
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
      description: 'Open the Study Hub to review the source document, summary, flashcards, and exam prep in one place.'
    }
  ];

  const featureCards = [
    {
      title: 'Upload the documents you already study from',
      description: 'Bring in lecture notes, PDFs, DOCX files, or slide decks and keep the work tied to the original material.'
    },
    {
      title: 'Generate a clear study summary',
      description: 'Turn long files into readable summaries that help you review the important parts faster.'
    },
    {
      title: 'Practice with flashcards',
      description: 'Create question-and-answer cards from the same document so memorization stays connected to your course material.'
    },
    {
      title: 'Prepare with exam-style questions',
      description: 'Move from reading to practice questions without switching tools or losing the document context.'
    }
  ];

  const faqs = [
    {
      question: 'What does Study Maxing do?',
      answer: 'It lets you upload study documents, generate summaries, flashcards, and exam prep, then review those outputs inside the Study Hub.'
    },
    {
      question: 'Where do my documents and generated study materials live?',
      answer: 'They live under the Study Hub after you sign in. That is where your uploaded documents, summaries, flashcards, and exam prep are organized.'
    },
    {
      question: 'Do I need separate tools for summaries, flashcards, and exam prep?',
      answer: 'No. Study Maxing keeps those study outputs together so you can move from upload to review without rebuilding your workflow.'
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
        <h1>Study documents in one premium flow.</h1>
        <p class="hero-subtitle">
          Upload notes and course files, then find the generated summaries, flashcards, and exam prep under the Study Hub where your documents are organized.
        </p>

        <div class="hero-actions">
          <Button variant="primary" size="lg" type="button" on:click={() => goTo(SIGN_UP_PATH)}>Get started</Button>
          <Button variant="secondary" size="lg" type="button" on:click={() => goToSection('how-it-works')}>See how it works</Button>
        </div>
      </div>

      <Card class="hero-card" variant="raised" padding="lg" border="subtle">
        <div class="hero-card__header">
          <div>
            <p class="hero-card__eyebrow">Live workflow</p>
            <h2>From upload to study-ready output</h2>
          </div>
        </div>

        <div class="hero-card__stack">
          <div class="workflow-row">
            <span class="workflow-row__label">Upload</span>
            <strong>Biology Midterm Pack.pdf</strong>
            <p>Document is processed once and becomes the anchor for the rest of the workflow.</p>
          </div>

          <div class="study-hub-box">
            <span>Under Study Hub</span>
            <p>Your uploaded document, generated summary, flashcards, and exam prep stay together so you can review from one organized place.</p>
          </div>
        </div>
      </Card>
    </div>
  </section>

  <section id="features" class="section-shell">
    <div class="section-shell__inner">
      <div class="section-heading">
        <p class="section-eyebrow">What it does</p>
        <h2>Turn your study files into organized review material.</h2>
        <p>Study Maxing starts with the documents you upload, then helps you create the study outputs students actually use: summaries, flashcards, and exam prep.</p>
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

  <section id="faq" class="section-shell">
    <div class="section-shell__inner section-shell__inner--narrow">
      <div class="section-heading section-heading--center">
        <p class="section-eyebrow">FAQ</p>
        <h2>How Study Maxing helps you study</h2>
        <p>Upload your course material, generate useful study outputs, and keep everything together in the Study Hub.</p>
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

  .hero-copy h1,
  .hero-copy p,
  .section-heading p,
  .section-heading h2,
  :global(.feature-card) h3,
  :global(.feature-card) p,
  :global(.step-card) h3,
  :global(.step-card) p,
  :global(.final-cta) h2,
  :global(.final-cta) p {
    margin: 0;
  }

  .hero-copy h1 {
    max-width: 10ch;
    font-size: clamp(2.8rem, 7vw, 5.15rem);
    line-height: 0.95;
    letter-spacing: -0.065em;
  }

  .hero-subtitle {
    max-width: 58ch;
    color: var(--ui-text-secondary);
    font-size: clamp(1rem, 2vw, 1.12rem);
    line-height: 1.72;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .step-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2rem;
    border-radius: var(--ui-radius-pill);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  :global(.hero-card) {
    position: relative;
    overflow: hidden;
  }

  :global(.hero-card)::after {
    content: '';
    position: absolute;
    inset: auto -12% -25% 45%;
    height: 12rem;
    background: radial-gradient(circle, color-mix(in srgb, var(--ui-text-primary) 10%, transparent), transparent 70%);
    pointer-events: none;
  }

  .hero-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .hero-card__eyebrow {
    margin: 0 0 0.35rem;
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .hero-card__header h2 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 1.4rem;
    line-height: 1.1;
    letter-spacing: -0.04em;
  }

  .hero-card__stack {
    display: grid;
    gap: 1rem;
  }

  .workflow-row,
  .study-hub-box {
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 92%, transparent);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-card) 82%, transparent);
  }

  .workflow-row {
    display: grid;
    gap: 0.45rem;
    padding: 1rem;
  }

  .workflow-row__label {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .workflow-row strong,
  .workflow-row p,
  .study-hub-box span,
  .study-hub-box p,
  .faq-trigger span,
  .faq-content p {
    margin: 0;
  }

  .workflow-row strong,
  .study-hub-box span {
    color: var(--ui-text-primary);
  }

  .workflow-row p,
  .study-hub-box p,
  .faq-content p {
    color: var(--ui-text-secondary);
    line-height: 1.6;
  }

  .feature-grid,
  .step-grid {
    display: grid;
    gap: 1rem;
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .study-hub-box {
    display: grid;
    gap: 0.55rem;
    padding: 1rem;
  }

  .section-heading {
    display: grid;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .section-heading--center {
    text-align: center;
    justify-items: center;
  }

  .section-eyebrow {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .section-heading h2,
  :global(.final-cta) h2 {
    max-width: 18ch;
    color: var(--ui-text-primary);
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1;
    letter-spacing: -0.05em;
  }

  .section-heading p,
  :global(.final-cta) p {
    max-width: 62ch;
    color: var(--ui-text-secondary);
    line-height: 1.7;
  }

  :global(.feature-card) {
    min-height: 100%;
  }

  .feature-card__marker {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--ui-radius-md);
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 92%, transparent);
    background:
      radial-gradient(circle at top left, color-mix(in srgb, var(--ui-text-primary) 14%, transparent), transparent 55%),
      color-mix(in srgb, var(--ui-surface-secondary) 78%, var(--ui-surface-card) 22%);
  }

  .step-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  :global(.step-card) {
    min-height: 100%;
  }

  .step-index {
    width: fit-content;
    padding: 0 0.8rem;
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 92%, transparent);
    background: color-mix(in srgb, var(--ui-surface-secondary) 72%, transparent);
    color: var(--ui-text-primary);
  }

  :global(.final-cta) {
    gap: 1.5rem;
  }

  .faq-list {
    display: grid;
    gap: 0.9rem;
  }

  :global(.faq-card) {
    overflow: hidden;
  }

  .faq-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border: 0;
    background: transparent;
    color: var(--ui-text-primary);
    text-align: left;
    cursor: pointer;
  }

  .faq-trigger:hover {
    background: color-mix(in srgb, var(--ui-surface-secondary) 58%, transparent);
  }

  .faq-trigger__icon {
    flex-shrink: 0;
    color: var(--ui-text-primary);
    font-size: 1.2rem;
    font-weight: 700;
  }

  .faq-content {
    padding: 0 1.1rem 1rem;
  }

  :global(.final-cta) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  @media (max-width: 960px) {
    .hero-grid,
    .step-grid,
    .feature-grid {
      grid-template-columns: 1fr;
    }

    :global(.final-cta) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 640px) {
    .section-shell__inner,
    .section-shell__inner--narrow {
      width: min(100% - 24px, var(--size-content));
      padding: 2.5rem 0;
    }

    .hero-copy h1,
    .section-heading h2,
    :global(.final-cta) h2 {
      max-width: 100%;
    }

    .hero-actions {
      display: grid;
      grid-template-columns: 1fr;
    }
  }
</style>
