<script>
  import { availableLanguages, language } from '../../stores/language.js';
  import { t } from '../../i18n/t.js';
  import Tabs from './Tabs.svelte';

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

<Tabs
  className="language-toggle"
  ariaLabel={t('language.toggleLabel')}
  items={localizedLanguages.map((lang) => ({
    value: lang.code,
    label: lang.label,
    meta: lang.shortLabel
  }))}
  value={currentLanguage}
  fullWidth
  size="lg"
  on:change={handleChange}
/>

<style>
  :global(.language-toggle) {
    min-width: 200px;
  }

  :global(.language-toggle .ui-tabs__tab) {
    min-width: 0;
  }

  :global(.language-toggle .ui-tabs__meta) {
    color: inherit;
    opacity: 0.72;
  }

  :global(.language-toggle .ui-tabs__label) {
    font-weight: 700;
  }

  :global(.language-toggle .ui-tabs__tab[aria-selected='true']) {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 16%, transparent), var(--ui-shadow-1);
  }

  :global(.language-toggle .ui-tabs__tab[aria-selected='false']) {
    color: var(--ui-text-secondary);
  }

  :global(.language-toggle .ui-tabs__tab[aria-selected='false'] .ui-tabs__meta) {
    opacity: 0.95;
  }
</style>
