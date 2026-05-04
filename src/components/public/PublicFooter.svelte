<script>
  export let compact = false;

  const productLinks = [
    { label: 'Features', href: '#/?section=features' },
    { label: 'How it works', href: '#/?section=how-it-works' },
    { label: 'Sign in', href: '#/sign-in' },
    { label: 'Get started', href: '#/sign-up' }
  ];

  const companyItems = [
    'Built for focused document-based study',
    'Product updates and school support coming soon'
  ];

  const legalLinks = [
    { label: 'Privacy policy',       href: '#/legal/privacy-policy' },
    { label: 'Terms of service',     href: '#/legal/terms-of-service' },
    { label: 'Cookie policy',        href: '#/legal/cookie-policy' },
    { label: 'Refund policy',        href: '#/legal/refund-policy' },
    { label: 'Disclaimer',           href: '#/legal/disclaimer' },
    { label: 'Acceptable use',       href: '#/legal/acceptable-use' },
  ];

  const supportItems = [
    'contact@studymaxing.com',
    'Use this email for support, feedback, and account questions'
  ];

  const socialItems = [
    'Social links coming soon'
  ];
</script>

<footer class:compact class="public-footer">
  <div class="public-footer__inner">
    <div class="public-footer__lead">
      <div class="public-footer__brand">
        <div>
          <p class="public-footer__title">StudyMaxing</p>
        </div>
      </div>
      <p class="public-footer__meta">© 2026 StudyMaxing. All rights reserved.</p>
    </div>

    <div class="public-footer__grid">
      <section>
        <h2>Product</h2>
        <nav aria-label="Footer product links">
          {#each productLinks as link}
            <a href={link.href}>{link.label}</a>
          {/each}
        </nav>
      </section>

      <section>
        <h2>Company</h2>
        <ul>
          {#each companyItems as item}
            <li>{item}</li>
          {/each}
        </ul>
      </section>

      <section>
        <h2>Legal</h2>
        <nav aria-label="Footer legal links">
          {#each legalLinks as link}
            <a href={link.href}>{link.label}</a>
          {/each}
        </nav>
      </section>

      <section>
        <h2>Support</h2>
        <ul>
          {#each supportItems as item}
            <li>{item}</li>
          {/each}
        </ul>
      </section>

      <section>
        <h2>Social</h2>
        <ul>
          {#each socialItems as item}
            <li>{item}</li>
          {/each}
        </ul>
      </section>
    </div>
  </div>
</footer>

<style>
  .public-footer {
    border-top: 1px solid color-mix(in srgb, var(--ui-border-default) 90%, transparent);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-bg-page) 98%, transparent), color-mix(in srgb, var(--ui-surface-card) 92%, var(--ui-bg-page) 8%));
  }

  .public-footer.compact {
    margin-top: auto;
  }

  .public-footer__inner {
    width: min(var(--size-content), calc(100% - 32px));
    margin: 0 auto;
    padding: 2.5rem 0 2rem;
    display: grid;
    gap: 2rem;
  }

  .public-footer__lead {
    display: grid;
    gap: 1rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid color-mix(in srgb, var(--ui-border-default) 90%, transparent);
  }

  .public-footer__brand {
    display: flex;
    align-items: flex-start;
    gap: 0.9rem;
  }

  .public-footer__title,
  .public-footer__meta,
  .public-footer h2,
  .public-footer ul,
  .public-footer li {
    margin: 0;
  }

  .public-footer__title {
    color: var(--ui-text-primary);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .public-footer__meta {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
  }

  .public-footer__grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 1.5rem;
  }

  .public-footer section {
    display: grid;
    gap: 0.8rem;
  }

  .public-footer h2 {
    color: var(--ui-text-primary);
    font-size: var(--ui-type-label);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .public-footer nav,
  .public-footer ul {
    display: grid;
    gap: 0.55rem;
    padding: 0;
    list-style: none;
  }

  .public-footer a,
  .public-footer li {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.5;
  }

  .public-footer a:hover {
    color: var(--ui-text-primary);
  }

  @media (max-width: 960px) {
    .public-footer__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .public-footer__inner {
      width: min(100% - 24px, var(--size-content));
      padding: 2rem 0 1.5rem;
    }

    .public-footer__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
