<script>
  import { availableLanguages, language } from '../../stores/language.js';
  import { t } from '../../i18n/t.js';

  $: currentLanguage = $language;

  function select(lang) {
    if (lang !== currentLanguage) {
      $language = lang;
    }
  }

  $: localizedLanguages = availableLanguages.map((lang) => ({
    ...lang,
    label: t(lang.labelKey),
  }));
</script>

<div class="language-toggle" role="group" aria-label={t('language.toggleLabel')}>
  {#each localizedLanguages as lang}
    <button
      class="toggle-option"
      type="button"
      aria-pressed={currentLanguage === lang.code}
      on:click={() => select(lang.code)}
    >
      <span class="option-code">{lang.shortLabel}</span>
      <span class="option-label">{lang.label}</span>
    </button>
  {/each}
</div>

<style>
  .language-toggle {
    display: inline-flex;
    gap: var(--space-1);
    padding: var(--space-1);
    border-radius: var(--radius-2);
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
  }

  .toggle-option {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: var(--space-1) var(--space-3);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-muted);
    background: transparent;
    border: none;
    border-radius: var(--radius-1);
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .toggle-option[aria-pressed="true"] {
    color: var(--color-text-primary);
    background: var(--color-accent-surface);
    box-shadow: 0 0 0 1px var(--color-accent-primary) inset;
  }

  .toggle-option:hover {
    color: var(--color-text-primary);
  }

  .option-code {
    font-size: var(--font-size-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .option-label {
    font-size: var(--font-size-sm);
  }

  @media (max-width: 480px) {
    .toggle-option {
      padding: var(--space-1) var(--space-2);
      flex-direction: row;
      gap: var(--space-1);
    }

    .option-label {
      font-size: var(--font-size-xs);
    }
  }
</style>
