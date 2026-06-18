<script>
  import { t } from '../../lib/i18n/t.js';
  import { language } from '../../lib/stores/language.js';
  import { router } from '../../stores/router.js';

  export let compact = false;

  const productLinks = [
    { labelKey: 'publicFooter.productLinks.features', href: '#/?section=features' },
    { labelKey: 'publicFooter.productLinks.howItWorks', href: '#/?section=how-it-works' },
    { labelKey: 'publicFooter.productLinks.signIn', href: '#/sign-in' },
    { labelKey: 'publicFooter.productLinks.getStarted', href: '#/sign-up' }
  ];

  const legalLinks = [
    { labelKey: 'publicFooter.legalLinks.privacyPolicy',   href: '#/legal/privacy-policy' },
    { labelKey: 'publicFooter.legalLinks.termsOfService',  href: '#/legal/terms-of-service' },
    { labelKey: 'publicFooter.legalLinks.cookiePolicy',    href: '#/legal/cookie-policy' },
    { labelKey: 'publicFooter.legalLinks.refundPolicy',    href: '#/legal/refund-policy' },
    { labelKey: 'publicFooter.legalLinks.disclaimer',      href: '#/legal/disclaimer' },
    { labelKey: 'publicFooter.legalLinks.acceptableUse',   href: '#/legal/acceptable-use' },
  ];

  $: currentLanguage = $language;
  $: supportEmail = t('publicFooter.supportItems.email');

  function navigateInternal(event, href) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      !href.startsWith('#/')
    ) {
      return;
    }

    event.preventDefault();
    router.navigate(href.slice(1));
    if (href.startsWith('#/legal')) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
    }
  }
</script>

<footer class:compact class="public-footer" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
  <div class="public-footer__inner">
    <div class="public-footer__lead">
      <div class="public-footer__brand">
        <div>
          <p class="public-footer__title">{t('publicHeader.brandName')}</p>
        </div>
      </div>
    </div>

    <div class="public-footer__grid">
      <section>
        <h2>{t('publicFooter.sections.product')}</h2>
        <nav aria-label={t('publicFooter.aria.productLinks')}>
          {#each productLinks as link}
            <a href={link.href} on:click={(event) => navigateInternal(event, link.href)}>{t(link.labelKey)}</a>
          {/each}
        </nav>
      </section>

      <section>
        <h2>{t('publicFooter.sections.legal')}</h2>
        <nav aria-label={t('publicFooter.aria.legalLinks')}>
          {#each legalLinks as link}
            <a href={link.href} on:click={(event) => navigateInternal(event, link.href)}>{t(link.labelKey)}</a>
          {/each}
        </nav>
      </section>

      <section>
        <h2>{t('publicFooter.sections.support')}</h2>
        <nav aria-label={t('publicFooter.aria.supportLinks')}>
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </nav>
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
  .public-footer h2 {
    margin: 0;
  }

  .public-footer__title {
    color: var(--ui-text-primary);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .public-footer__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
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

  .public-footer nav {
    display: grid;
    gap: 0.55rem;
    padding: 0;
    list-style: none;
  }

  .public-footer a {
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
