<script>
  import { router } from '../stores/router.js';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import Badge from '../lib/components/ui/Badge.svelte';

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Study Flow', href: '#study-flow' },
    { label: 'FAQ', href: '#faq' }
  ];

  const features = [
    {
      title: 'Document upload and processing',
      description: 'Upload PDF, DOCX, and PPTX files into one structured workspace with clear processing states.'
    },
    {
      title: 'Summaries built for review',
      description: 'Generate readable summaries without turning the interface into a noisy AI playground.'
    },
    {
      title: 'Flashcards and mock exams',
      description: 'Move from source material into study-ready practice with a compact, focused workflow.'
    },
    {
      title: 'Organized study hub',
      description: 'Each document becomes a clean entry point for summary, flashcards, exams, and metadata.'
    },
    {
      title: 'Premium dashboard density',
      description: 'Recent documents, upload controls, statuses, and admin views all share the same calm system.'
    },
    {
      title: 'Built for clarity',
      description: 'Primary emphasis comes from spacing, borders, and typography instead of loud gradients or effects.'
    }
  ];

  const steps = [
    {
      title: 'Upload source material',
      description: 'Add a document once and keep the workflow anchored to the original file.'
    },
    {
      title: 'Generate study assets',
      description: 'Create summaries, flashcards, and exam questions as separate but connected outputs.'
    },
    {
      title: 'Review in one hub',
      description: 'Switch between generated modes without losing context or navigating through clutter.'
    }
  ];

  const faqs = [
    {
      question: 'What file formats are supported?',
      answer: 'PDF, DOCX, and PPTX uploads remain supported through the existing upload flow.'
    },
    {
      question: 'Can I regenerate content later?',
      answer: 'Yes. Summary, flashcards, and exam generation still follow the current on-demand workflow.'
    },
    {
      question: 'Does each document keep its own study materials?',
      answer: 'Yes. The document library and study hub continue to group generated content by document.'
    },
    {
      question: 'Is this only for students?',
      answer: 'No. The interface works equally well for students, professionals, and anyone reviewing document-heavy material.'
    }
  ];

  let openFaq = 0;

  function goToSignIn() {
    router.navigate('/sign-in');
  }

  function goToSignUp() {
    router.navigate('/sign-up');
  }

  function toggleFaq(index) {
    openFaq = openFaq === index ? -1 : index;
  }
</script>

<div class="landing-page">
  <header class="landing-header">
    <div class="landing-header__inner">
      <a class="brand" href="#top" aria-label="AI Study Assistant">
        <span class="brand-mark">AI</span>
        <span class="brand-wordmark">AI Study Assistant</span>
      </a>

      <nav class="landing-nav" aria-label="Landing">
        {#each navLinks as link}
          <a href={link.href}>{link.label}</a>
        {/each}
      </nav>

      <div class="landing-actions">
        <Button variant="ghost" size="sm" type="button" on:click={goToSignIn}>Sign in</Button>
        <Button variant="primary" size="sm" type="button" on:click={goToSignUp}>Get started</Button>
      </div>
    </div>
  </header>

  <main id="top">
    <section class="hero section-shell section-shell--hero">
      <div class="section-shell__inner hero-grid">
        <div class="hero-copy">
          <Badge tone="neutral" variant="soft" size="sm" className="hero-badge">Premium AI Study Workspace</Badge>
          <h1>Transform documents into structured knowledge.</h1>
          <p class="hero-subtitle">
            Upload your study materials, generate summaries, flashcards, and practice exams, and review everything in a single calm interface.
          </p>
          <div class="hero-actions">
            <Button variant="primary" size="lg" type="button" on:click={goToSignUp}>Get started</Button>
            <Button variant="secondary" size="lg" type="button" on:click={() => (window.location.hash = '#how-it-works')}>See how it works</Button>
          </div>
          <div class="hero-points">
            <span>PDF, DOCX, PPTX</span>
            <span>Study hub workflow</span>
            <span>Dashboard + admin parity</span>
          </div>
        </div>

        <Card class="hero-preview" variant="raised" padding="sm" border="subtle">
          <div class="preview-window">
            <div class="preview-window__top">
              <div class="preview-status">
                <span class="preview-status__dot"></span>
                <span>Ready</span>
              </div>
              <span>3 active documents</span>
            </div>

            <div class="preview-window__body">
              <div class="preview-panel">
                <p class="preview-label">Documents</p>
                <div class="preview-list">
                  <div class="preview-item"><span>Biology Chapter 4.pdf</span><span>Ready</span></div>
                  <div class="preview-item"><span>Lecture Notes.docx</span><span>Queued</span></div>
                  <div class="preview-item"><span>Study Guide.pptx</span><span>Ready</span></div>
                </div>
              </div>

              <div class="preview-stack">
                <div class="preview-panel">
                  <p class="preview-label">Summary</p>
                  <div class="preview-lines">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span class="preview-lines__short"></span>
                  </div>
                </div>

                <div class="preview-grid">
                  <div class="preview-panel">
                    <p class="preview-label">Flashcards</p>
                    <div class="preview-card-lines">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>

                  <div class="preview-panel">
                    <p class="preview-label">Mock exam</p>
                    <div class="preview-metric">10 questions ready</div>
                    <div class="preview-progress"><span></span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>

    <section id="features" class="section-shell">
      <div class="section-shell__inner">
        <div class="section-heading">
          <p class="section-eyebrow">Features</p>
          <h2>Everything your current workflow already does, expressed through one cleaner system.</h2>
          <p>Landing, dashboard, upload, study hub, and admin surfaces should all feel like the same product.</p>
        </div>

        <div class="feature-grid">
          {#each features as feature}
            <Card class="feature-card" variant="base" padding="md" border="subtle" hoverable>
              <div class="feature-card__icon"></div>
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
          <p class="section-eyebrow">How It Works</p>
          <h2>A simple three-step flow built around the existing product behavior.</h2>
        </div>

        <div class="step-grid">
          {#each steps as step, index}
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
        <Card class="study-flow" variant="base" padding="lg" border="subtle">
          <div class="study-flow__copy">
            <p class="section-eyebrow">Study Flow</p>
            <h2>From upload to review, the product stays compact, readable, and structured.</h2>
            <p>
              The same dark neutral language applies to upload states, recent documents, generated content blocks, tabs, tables, and metadata rows.
            </p>
          </div>

          <div class="study-flow__panels">
            <div class="study-flow__panel">
              <span class="study-flow__label">Upload</span>
              <strong>Bordered intake surface</strong>
              <p>Dense controls, muted helper copy, and clearly clickable actions.</p>
            </div>
            <div class="study-flow__panel">
              <span class="study-flow__label">Library</span>
              <strong>Structured document cards</strong>
              <p>Recent documents, statuses, and actions align to the same spacing rhythm.</p>
            </div>
            <div class="study-flow__panel">
              <span class="study-flow__label">Study Hub</span>
              <strong>Readable generated outputs</strong>
              <p>Summary, flashcards, and exam views prioritize hierarchy and contrast over decoration.</p>
            </div>
          </div>
        </Card>
      </div>
    </section>

    <section id="faq" class="section-shell">
      <div class="section-shell__inner section-shell__inner--narrow">
        <div class="section-heading section-heading--center">
          <p class="section-eyebrow">FAQ</p>
          <h2>Common questions</h2>
        </div>

        <div class="faq-list">
          {#each faqs as item, index}
            <div class="faq-item">
              <button type="button" class="faq-trigger" aria-expanded={openFaq === index} on:click={() => toggleFaq(index)}>
                <span>{item.question}</span>
                <span class="faq-trigger__icon">{openFaq === index ? '−' : '+'}</span>
              </button>
              {#if openFaq === index}
                <div class="faq-content">
                  <p>{item.answer}</p>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="section-shell">
      <div class="section-shell__inner">
        <Card class="final-cta" variant="raised" padding="lg" border="subtle">
          <div>
            <p class="section-eyebrow">Get Started</p>
            <h2>Bring the rest of your study workflow into one premium interface.</h2>
            <p>No backend changes. No workflow changes. Just a sharper system for the product you already use.</p>
          </div>
          <div class="final-cta__actions">
            <Button variant="primary" size="lg" type="button" on:click={goToSignUp}>Open the app</Button>
            <Button variant="secondary" size="lg" type="button" on:click={() => (window.location.hash = '#features')}>Review features</Button>
          </div>
        </Card>
      </div>
    </section>
  </main>
</div>

<style>
  .landing-page {
    min-height: 100vh;
    background: var(--color-bg);
    color: var(--color-text-primary);
  }

  .landing-header {
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid var(--ui-border-subtle);
    background: rgba(9, 9, 11, 0.92);
  }

  .landing-header__inner,
  .section-shell__inner {
    width: min(var(--size-content), calc(100% - 32px));
    margin: 0 auto;
  }

  .landing-header__inner {
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    color: var(--color-text-primary);
  }

  .brand-mark {
    width: 28px;
    height: 28px;
    border-radius: var(--ui-radius-sm);
    border: 1px solid var(--ui-border-subtle);
    background: var(--ui-surface-raised);
    display: grid;
    place-items: center;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .brand-wordmark {
    font-size: 0.88rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .landing-nav,
  .landing-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .landing-nav {
    gap: 1.25rem;
  }

  .landing-nav a {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .landing-nav a:hover {
    color: var(--color-text-primary);
  }

  .section-shell {
    border-bottom: 1px solid var(--ui-border-subtle);
  }

  .section-shell__inner {
    padding: var(--space-7) 0;
  }

  .section-shell__inner--narrow {
    width: min(820px, calc(100% - 32px));
  }

  .section-shell--hero .section-shell__inner {
    padding: 4.5rem 0 4rem;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
    gap: var(--space-7);
    align-items: center;
  }

  .hero-copy {
    display: grid;
    gap: var(--space-4);
    align-content: start;
  }

  :global(.hero-badge) {
    width: fit-content;
  }

  .hero-copy h1 {
    margin: 0;
    font-size: clamp(2.45rem, 5vw, 4.3rem);
    line-height: 1;
    letter-spacing: -0.045em;
    max-width: 11ch;
  }

  .hero-subtitle {
    margin: 0;
    max-width: 60ch;
    color: var(--color-text-secondary);
    font-size: clamp(1rem, 2vw, 1.08rem);
    line-height: 1.65;
  }

  .hero-actions,
  .final-cta__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .hero-points {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .hero-points span {
    padding: 0.32rem 0.52rem;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-pill);
    background: rgba(255, 255, 255, 0.02);
  }

  :global(.hero-preview) {
    min-width: 0;
  }

  .preview-window {
    border: 1px solid var(--ui-border-subtle);
    border-radius: calc(var(--ui-radius-md) - 1px);
    background: var(--color-bg);
    overflow: hidden;
  }

  .preview-window__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: 0.8rem 0.95rem;
    border-bottom: 1px solid var(--ui-border-subtle);
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }

  .preview-status {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }

  .preview-status__dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #22c55e;
  }

  .preview-window__body {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--ui-surface-base);
  }

  .preview-stack,
  .preview-grid,
  .preview-list {
    display: grid;
    gap: var(--space-3);
  }

  .preview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .preview-panel {
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: rgba(255, 255, 255, 0.025);
    padding: var(--space-3);
  }

  .preview-label {
    margin: 0 0 0.8rem;
    color: var(--color-text-muted);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .preview-item {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    padding: 0.55rem 0.65rem;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: var(--color-bg);
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }

  .preview-lines,
  .preview-card-lines {
    display: grid;
    gap: 0.45rem;
  }

  .preview-lines span,
  .preview-card-lines span {
    display: block;
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
  }

  .preview-lines__short {
    width: 74%;
  }

  .preview-metric {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 600;
    margin-bottom: 0.9rem;
  }

  .preview-progress {
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .preview-progress span {
    display: block;
    width: 68%;
    height: 100%;
    background: rgba(255, 255, 255, 0.26);
  }

  .section-heading {
    display: grid;
    gap: var(--space-2);
    max-width: 760px;
    margin-bottom: var(--space-6);
  }

  .section-heading--center {
    text-align: center;
    margin-inline: auto;
  }

  .section-eyebrow {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .section-heading h2,
  .study-flow__copy h2,
  :global(.final-cta h2) {
    margin: 0;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    line-height: 1.08;
    letter-spacing: -0.04em;
    max-width: 18ch;
  }

  .section-heading p,
  .study-flow__copy p,
  :global(.final-cta p) {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.65;
  }

  .feature-grid,
  .step-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
  }

  :global(.feature-card),
  :global(.step-card) {
    min-height: 100%;
  }

  .feature-card__icon {
    width: 34px;
    height: 34px;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: rgba(255, 255, 255, 0.03);
  }

  :global(.feature-card h3),
  :global(.step-card h3) {
    margin: 0;
    font-size: 0.96rem;
    letter-spacing: -0.02em;
  }

  :global(.feature-card p),
  :global(.step-card p) {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }

  .step-index {
    display: inline-flex;
    color: var(--color-text-muted);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  :global(.study-flow) {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: var(--space-6);
  }

  .study-flow__copy {
    display: grid;
    gap: var(--space-2);
    align-content: start;
  }

  .study-flow__panels {
    display: grid;
    gap: var(--space-3);
  }

  .study-flow__panel {
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    background: rgba(255, 255, 255, 0.02);
    padding: var(--space-4);
    display: grid;
    gap: 0.45rem;
  }

  .study-flow__label {
    color: var(--color-text-muted);
    font-size: 0.67rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .study-flow__panel strong {
    color: var(--color-text-primary);
    font-size: 0.95rem;
    letter-spacing: -0.02em;
  }

  .study-flow__panel p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .faq-list {
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
  }

  .faq-item + .faq-item {
    border-top: 1px solid var(--ui-border-subtle);
  }

  .faq-trigger {
    width: 100%;
    padding: 1rem 1rem;
    border: 0;
    background: transparent;
    color: var(--color-text-primary);
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    align-items: center;
    text-align: left;
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  .faq-trigger:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .faq-content {
    padding: 0 1rem 1rem;
  }

  .faq-content p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.65;
  }

  :global(.final-cta) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-6);
  }

  @media (max-width: 960px) {
    .hero-grid,
    :global(.study-flow),
    .feature-grid,
    .step-grid,
    .preview-window__body {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 840px) {
    .landing-nav {
      display: none;
    }
  }

  @media (max-width: 720px) {
    .landing-header__inner,
    .section-shell__inner,
    .section-shell__inner--narrow {
      width: min(calc(100% - 24px), var(--size-content));
    }

    .section-shell__inner {
      padding: var(--space-6) 0;
    }

    .landing-actions :global(.ui-button:first-child) {
      display: none;
    }

    .hero-copy h1 {
      max-width: none;
    }

    .preview-grid,
    .feature-grid,
    .step-grid,
    :global(.final-cta) {
      grid-template-columns: 1fr;
      display: grid;
    }

    :global(.final-cta) {
      gap: var(--space-4);
    }
  }
</style>
