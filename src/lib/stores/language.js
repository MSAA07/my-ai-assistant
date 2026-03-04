import { derived, writable } from 'svelte/store';

const STORAGE_KEY = 'lang';
const DEFAULT_LANGUAGE = 'en';
export const availableLanguages = [
  { code: 'en', labelKey: 'language.english', shortLabel: 'EN' },
  { code: 'ar', labelKey: 'language.arabic', shortLabel: 'AR' }
];
const isBrowser = typeof window !== 'undefined';

function readInitialLanguage() {
  if (!isBrowser) return DEFAULT_LANGUAGE;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'ar') {
    return stored;
  }

  const navigatorLang = window.navigator.language?.toLowerCase() ?? '';
  if (navigatorLang.startsWith('ar')) {
    return 'ar';
  }

  return DEFAULT_LANGUAGE;
}

function applyLanguageSettings(lang) {
  if (!isBrowser) return;

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const font = lang === 'ar' ? 'var(--font-family-ar)' : 'var(--font-family-en)';

  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  document.documentElement.dataset.dir = dir;
  document.body.dataset.dir = dir;
  document.body.style.fontFamily = font;
  document.documentElement.style.setProperty('--font-family-base', font);
  window.localStorage.setItem(STORAGE_KEY, lang);
}

const initialLanguage = readInitialLanguage();
const languageStore = writable(initialLanguage);

if (isBrowser) {
  applyLanguageSettings(initialLanguage);
}

languageStore.subscribe((lang) => {
  applyLanguageSettings(lang);
});

export const language = languageStore;

export const direction = derived(language, ($lang) => ($lang === 'ar' ? 'rtl' : 'ltr'));

export const isRTL = derived(direction, ($dir) => $dir === 'rtl');

export const currentFontFamily = derived(language, ($lang) =>
  $lang === 'ar' ? 'var(--font-family-ar)' : 'var(--font-family-en)'
);

export function toggleLanguage() {
  language.update((lang) => (lang === 'ar' ? 'en' : 'ar'));
}
