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
      size="sm"
      className={`language-toggle__button ${currentLanguage === lang.code ? 'language-toggle__button--active' : ''}`}
      on:click={() => select(lang.code)}
      aria-pressed={currentLanguage === lang.code}
      aria-label={lang.label}
      title={lang.label}
    >
      <span class="language-toggle__short">{lang.shortLabel}</span>
    </Button>
  {/each}
</div>

<style>
  .language-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-2);
    flex-wrap: nowrap;
  }

  :global(.language-toggle__button.ui-button) {
    min-width: 0;
    box-shadow: none;
    min-height: 2.75rem;
    padding-inline: var(--ui-space-3);
  }

  :global(.language-toggle__button--active.ui-button) {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 14%, transparent);
  }

  .language-toggle__short {
    min-width: 1.2rem;
    text-align: center;
    font-weight: 700;
    line-height: 1;
  }
</style>
