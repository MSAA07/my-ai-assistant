<script>
  import { availableLanguages, language } from '../../stores/language.js';
  import { t } from '../../i18n/t.js';
  import Button from './Button.svelte';

  $: currentLanguage = $language;

  function select(lang) {
    if (lang !== currentLanguage) {
      $language = lang;
    }
  }

  function handleChange(event) {
    select(event.detail.value);
  }

  $: localizedLanguages = availableLanguages.map((lang) => ({
    ...lang,
    label: t(lang.labelKey),
  }));
</script>

<div class="language-toggle" role="group" aria-label={t('language.toggleLabel')}>
  {#each localizedLanguages as lang}
    <Button
      type="button"
      variant={currentLanguage === lang.code ? 'primary' : 'outline'}
      size="md"
      className={`language-toggle__button ${currentLanguage === lang.code ? 'language-toggle__button--active' : ''}`}
      on:click={() => select(lang.code)}
      aria-pressed={currentLanguage === lang.code}
    >
      <span class="language-toggle__label">{lang.label}</span>
      <span class="language-toggle__meta">{lang.shortLabel}</span>
    </Button>
  {/each}
</div>

<style>
  .language-toggle {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    min-width: 200px;
  }

  :global(.language-toggle__button.ui-button) {
    min-width: 0;
    box-shadow: none;
    padding-inline: 1rem;
  }

  :global(.language-toggle__button--active.ui-button) {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 14%, transparent);
  }

  .language-toggle__label {
    font-weight: 700;
  }

  .language-toggle__meta {
    font-size: 0.78rem;
    opacity: 0.78;
  }
</style>
