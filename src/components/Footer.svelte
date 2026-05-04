<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="footer-mark">SM</div>
      <p class="footer-title">StudyMaxing</p>
    </div>

    <div class="footer-columns">
      <div class="footer-col">
        <p class="footer-col-heading">PRODUCT</p>
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <a href="/signin">Sign in</a>
        <a href="/signup">Get started</a>
      </div>

      <div class="footer-col">
        <p class="footer-col-heading">LEGAL</p>
        <a href="/legal/privacy-policy">Privacy policy</a>
        <a href="/legal/terms-of-service">Terms of service</a>
        <a href="/legal/cookie-policy">Cookie policy</a>
        <a href="/legal/refund-policy">Refund policy</a>
        <a href="/legal/disclaimer">Disclaimer</a>
        <a href="/legal/acceptable-use">Acceptable use</a>
      </div>

      <div class="footer-col">
        <p class="footer-col-heading">SUPPORT</p>
        <a href="mailto:contact@studymaxing.com">contact@studymaxing.com</a>
      </div>

      <div class="footer-col">
        <p class="footer-col-heading">SOCIAL</p>
        <a href="#">X (Twitter)</a>
        <a href="#">Whatsapp</a>
        <a href="#">LinkedIn</a>
        <a href="#">Telegram</a>
      </div>
    </div>
  </div>

  <div class="footer-meta">
    <p class="footer-text">© {new Date().getFullYear()} StudyMaxing. All rights reserved.</p>
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
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
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

  .footer-title {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 0.92rem;
    font-weight: 600;
  }

  .footer-columns {
    display: flex;
    gap: var(--space-7);
    flex-wrap: wrap;
  }

  .footer-col {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    min-width: 120px;
  }

  .footer-col-heading {
    margin: 0 0 0.25rem;
    color: var(--color-text-primary);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .footer-col a {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    text-decoration: none;
  }

  .footer-col a:hover {
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

    .footer-columns {
      gap: var(--space-5);
    }
  }
</style>
