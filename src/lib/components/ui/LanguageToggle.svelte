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
  stacked
  on:change={handleChange}
/>

<style>
  :global(.language-toggle) {
    min-width: 120px;
  }
</style>
