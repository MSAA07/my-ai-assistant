import { derived, writable } from 'svelte/store';
import { ENABLE_ARABIC_UI } from '../config/features.js';

const STORAGE_KEY = 'lang';
const DEFAULT_LANGUAGE = 'en';

export const availableLanguages = ENABLE_ARABIC_UI
  ? [
      { code: 'en', labelKey: 'language.english', shortLabel: 'EN' },
      { code: 'ar', labelKey: 'language.arabic', shortLabel: 'ع' }
    ]
  : [{ code: 'en', labelKey: 'language.english', shortLabel: 'EN' }];
const isBrowser = typeof window !== 'undefined';

function readInitialLanguage() {
  if (!ENABLE_ARABIC_UI) return DEFAULT_LANGUAGE;
  if (!isBrowser) return DEFAULT_LANGUAGE;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'ar') {
    return stored;
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
  document.documentElement.dataset.language = lang;
  document.body.dir = dir;
  document.body.dataset.dir = dir;
  document.body.dataset.language = lang;
  document.body.style.fontFamily = font;
  document.documentElement.style.setProperty('--font-family-base', font);

  if (ENABLE_ARABIC_UI) {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
}

const initialLanguage = readInitialLanguage();
applyLanguageSettings(initialLanguage);

const languageStore = writable(initialLanguage);

languageStore.subscribe((lang) => {
  if (!ENABLE_ARABIC_UI && lang !== DEFAULT_LANGUAGE) {
    if (import.meta.env.DEV) {
      console.warn('[i18n] Arabic UI disabled; forcing English language.');
    }
    languageStore.set(DEFAULT_LANGUAGE);
    return;
  }
  applyLanguageSettings(lang);
});

export const language = languageStore;

export const direction = derived(language, ($lang) => ($lang === 'ar' ? 'rtl' : 'ltr'));

export const isRTL = derived(direction, ($dir) => $dir === 'rtl');

export const currentFontFamily = derived(language, ($lang) =>
  $lang === 'ar' ? 'var(--font-family-ar)' : 'var(--font-family-en)'
);

export function getCurrentLanguage() {
  let current = DEFAULT_LANGUAGE;
  language.subscribe((value) => {
    current = value;
  })();
  return current;
}

export function initializeLanguage() {
  applyLanguageSettings(getCurrentLanguage());
}

export function toggleLanguage() {
  if (!ENABLE_ARABIC_UI) return;
  language.update((lang) => (lang === 'ar' ? 'en' : 'ar'));
}
