<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  export let open = false;
  export let policy = 'privacy';

  const dispatch = createEventDispatcher();

  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
    refund: 'Refund Policy',
  };

  const content = {
    privacy: `
      <p class="legal-placeholder-notice">⚠ Placeholder — replace with your real Privacy Policy before publishing.</p>
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us when you create an account, upload documents, or contact us for support. This includes your email address, name, and the documents you upload for processing.</p>
      <h3>2. How We Use Your Information</h3>
      <p>We use the information we collect to provide, maintain, and improve the StudyMaxing service, to process your documents and generate study materials, and to communicate with you about your account and our service.</p>
      <h3>3. Data Storage and Security</h3>
      <p>Your data is stored on secure servers. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      <h3>4. Document Data</h3>
      <p>Documents you upload are processed to generate study materials. We do not share your documents or generated content with third parties except as necessary to provide the service.</p>
      <h3>5. Your Rights</h3>
      <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at contact@studymaxing.com.</p>
      <h3>6. Contact</h3>
      <p>For privacy-related questions, contact us at contact@studymaxing.com.</p>
    `,
    terms: `
      <p class="legal-placeholder-notice">⚠ Placeholder — replace with your real Terms of Service before publishing.</p>
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using StudyMaxing, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service.</p>
      <h3>2. Use of the Service</h3>
      <p>StudyMaxing provides AI-generated study materials from documents you upload. You are responsible for ensuring you have the right to upload any document you submit. You may not upload content that infringes on third-party rights or violates any applicable laws.</p>
      <h3>3. Account Responsibilities</h3>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
      <h3>4. Content Ownership</h3>
      <p>You retain ownership of documents you upload. By uploading documents, you grant StudyMaxing a limited license to process them for the purpose of generating your study materials.</p>
      <h3>5. Service Availability</h3>
      <p>We aim to provide a reliable service but do not guarantee uninterrupted availability. The service is provided "as is" during the early access period.</p>
      <h3>6. Modifications</h3>
      <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
      <h3>7. Contact</h3>
      <p>Questions about these terms? Contact us at contact@studymaxing.com.</p>
    `,
    cookies: `
      <p class="legal-placeholder-notice">⚠ Placeholder — replace with your real Cookie Policy before publishing.</p>
      <h3>1. What Are Cookies</h3>
      <p>Cookies are small text files stored on your device when you visit a website. StudyMaxing uses cookies to keep you signed in and to remember your preferences.</p>
      <h3>2. Cookies We Use</h3>
      <p><strong>Session cookies</strong> — required for authentication. These keep you signed in while you use the app and expire when you close your browser or sign out.</p>
      <p><strong>Preference cookies</strong> — store settings such as your selected language and theme. These persist across sessions.</p>
      <h3>3. Third-Party Cookies</h3>
      <p>StudyMaxing does not use advertising or tracking cookies. We do not share cookie data with third parties for marketing purposes.</p>
      <h3>4. Managing Cookies</h3>
      <p>You can control cookies through your browser settings. Disabling session cookies will prevent you from signing in to StudyMaxing.</p>
      <h3>5. Contact</h3>
      <p>Cookie questions? Contact us at contact@studymaxing.com.</p>
    `,
    refund: `
      <p class="legal-placeholder-notice">⚠ Placeholder — replace with your real Refund Policy before publishing.</p>
      <h3>Early Access Period</h3>
      <p>StudyMaxing is currently free during early access. No payment is required to use the service at this time, so there is nothing to refund.</p>
      <h3>Future Paid Plans</h3>
      <p>When paid plans are introduced, a refund policy will be published here with clear terms covering refund eligibility, request procedures, and timelines.</p>
      <h3>Questions</h3>
      <p>For any billing or payment questions, contact us at contact@studymaxing.com.</p>
    `,
  };

  $: title = titles[policy] ?? 'Legal';
  $: body = content[policy] ?? '';

  function close() {
    dispatch('close');
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') close();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="legal-backdrop" on:click={handleBackdropClick}>
    <div
      class="legal-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div class="legal-modal__header">
        <h2 id="legal-modal-title">{title}</h2>
        <button class="legal-modal__close" type="button" on:click={close} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="legal-modal__body">
        {@html body}
      </div>
    </div>
  </div>
{/if}

<style>
  .legal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--ui-backdrop, rgba(0,0,0,0.8));
  }

  .legal-modal {
    position: relative;
    width: min(640px, 100%);
    max-height: min(80vh, 720px);
    display: flex;
    flex-direction: column;
    border-radius: var(--ui-radius-lg, 1rem);
    border: 1px solid var(--ui-border-default, #2a2a2a);
    background: var(--ui-surface-overlay, #1f1f1f);
    box-shadow: var(--ui-shadow-3, 0 12px 32px rgba(0,0,0,0.48));
    overflow: hidden;
  }

  .legal-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--ui-border-default, #2a2a2a);
    flex: 0 0 auto;
  }

  .legal-modal__header h2 {
    margin: 0;
    color: var(--ui-text-primary, #fafafa);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .legal-modal__close {
    display: inline-flex;
    width: 2rem;
    height: 2rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ui-border-default, #2a2a2a);
    border-radius: var(--ui-radius-sm, 0.5rem);
    background: transparent;
    color: var(--ui-text-secondary, #a1a1a1);
    cursor: pointer;
    transition: background 140ms, color 140ms;
  }

  .legal-modal__close:hover {
    background: var(--ui-surface-ghost, rgba(255,255,255,0.05));
    color: var(--ui-text-primary, #fafafa);
  }

  .legal-modal__close:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .legal-modal__body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    color: var(--ui-text-secondary, #a1a1a1);
    font-size: 0.875rem;
    line-height: 1.65;
  }

  .legal-modal__body :global(h3) {
    margin: 1.25rem 0 0.5rem;
    color: var(--ui-text-primary, #fafafa);
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .legal-modal__body :global(h3:first-of-type) {
    margin-top: 0;
  }

  .legal-modal__body :global(p) {
    margin: 0 0 0.75rem;
  }

  .legal-modal__body :global(strong) {
    color: var(--ui-text-primary, #fafafa);
    font-weight: 600;
  }

  .legal-modal__body :global(.legal-placeholder-notice) {
    margin-bottom: 1.25rem;
    padding: 0.625rem 0.875rem;
    border-radius: var(--ui-radius-sm, 0.5rem);
    border: 1px solid color-mix(in srgb, var(--ui-accent-warning, #f59e0b) 28%, var(--ui-border-default, #2a2a2a) 72%);
    background: color-mix(in srgb, var(--ui-accent-warning, #f59e0b) 8%, transparent);
    color: color-mix(in srgb, var(--ui-accent-warning, #f59e0b) 80%, var(--ui-text-primary, #fafafa) 20%);
    font-size: 0.75rem;
    font-weight: 500;
  }
</style>
