<script>
  import { language, availableLanguages } from '../../stores/language.js';
  import { t } from '../../i18n/t.js';

  export let compact = false;

  const setLanguage = (code) => {
    language.setLanguage(code);
  };
</script>

<div class="language-toggle" role="radiogroup" aria-label={t('language.toggle')}>
  {#each availableLanguages as option (option.code)}
    <button
      type="button"
      role="radio"
      aria-checked={option.code === $language.code}
      class:active={option.code === $language.code}
      class:compact
      on:click={() => setLanguage(option.code)}
    >
      <span class="language-toggle__abbr">{option.code.toUpperCase()}</span>
      {#if !compact}
        <span class="language-toggle__label">
          {option.code === 'ar' ? option.nativeLabel : option.label}
        </span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .language-toggle {
    display: inline-flex;
    padding: 4px;
    background: var(--color-surface-1);
    border-radius: 999px;
    border: 1px solid var(--color-border);
    gap: 4px;
  }

  button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    min-inline-size: 44px;
    min-block-size: 36px;
    padding: 0 var(--space-2);
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--color-text-muted);
    font: inherit;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  button.active {
    background: var(--color-accent-bg);
    color: var(--color-text-primary);
  }

  button:hover,
  button:focus-visible {
    color: var(--color-text-primary);
    background: var(--color-accent-bg-hover);
    outline: none;
  }

  .language-toggle__abbr {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .language-toggle__label {
    font-size: 0.75rem;
  }

  button.compact {
    min-inline-size: 36px;
    padding-inline: var(--space-1);
  }

  @media (max-width: 640px) {
    button {
      min-inline-size: 40px;
    }
  }
</style>
