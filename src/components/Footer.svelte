<script>
  const productLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Study flow', href: '#study-flow' },
    { label: 'FAQ', href: '#faq' }
  ];
</script>

<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="footer-mark">AI</div>
      <div>
        <p class="footer-title">AI Study Assistant</p>
        <p class="footer-copy">Turn uploaded documents into summaries, flashcards, and exam prep with one clean workflow.</p>
      </div>
    </div>

    <nav class="footer-nav" aria-label="Footer">
      {#each productLinks as link}
        <a href={link.href}>{link.label}</a>
      {/each}
    </nav>
  </div>

  <div class="footer-meta">
    <p class="footer-text">Premium document study workspace.</p>
  </div>
</footer>

<style>
  .footer {
    border-top: 1px solid var(--ui-border-subtle);
    background: var(--color-bg);
    padding: var(--space-7) var(--space-4) var(--space-5);
  }

  .footer-inner {
    max-width: var(--size-content);
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
    padding-bottom: var(--space-5);
    border-bottom: 1px solid var(--ui-border-subtle);
  }

  .footer-brand {
    display: flex;
    gap: var(--space-3);
    max-width: 420px;
  }

  .footer-mark {
    width: 32px;
    height: 32px;
    border-radius: var(--ui-radius-sm);
    border: 1px solid var(--ui-border-subtle);
    background: var(--ui-surface-raised);
    display: grid;
    place-items: center;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .footer-title,
  .footer-copy {
    margin: 0;
  }

  .footer-title {
    color: var(--color-text-primary);
    font-size: 0.92rem;
    font-weight: 600;
  }

  .footer-copy {
    margin-top: 0.38rem;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }

  .footer-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: flex-end;
  }

  .footer-nav a {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .footer-nav a:hover {
    color: var(--color-text-primary);
  }

  .footer-meta {
    max-width: var(--size-content);
    margin: 0.9rem auto 0;
  }

  .footer-text {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin: 0;
  }

  @media (max-width: 720px) {
    .footer-inner {
      flex-direction: column;
    }

    .footer-nav {
      justify-content: flex-start;
    }
  }
</style>
