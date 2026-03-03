import { derived, get, writable } from 'svelte/store';
import en from '../i18n/en.js';
import ar from '../i18n/ar.js';

const STORAGE_KEY = 'lang';
const FALLBACK_LANG = 'en';
const DICTIONARIES = { en, ar };

const resolveDir = (lang) => (lang === 'ar' ? 'rtl' : 'ltr');

const resolveInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return FALLBACK_LANG;
  }

  const stored = window.localStorage?.getItem(STORAGE_KEY);
  if (stored && Object.hasOwn(DICTIONARIES, stored)) {
    return stored;
  }

  const browserLang = window.navigator?.language?.toLowerCase() ?? '';
  if (browserLang.startsWith('ar')) {
    return 'ar';
  }

  return FALLBACK_LANG;
};

const initialCode = resolveInitialLanguage();

const languageStore = writable({
  code: initialCode,
  dir: resolveDir(initialCode),
});

const applyEnvironment = (code, dir) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dir = dir;
  document.documentElement.lang = code;
  document.documentElement.dataset.dir = dir;
  document.documentElement.dataset.lang = code;
  document.documentElement.style.setProperty('--font-family-base', `var(--font-family-${code})`);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (error) {
      console.error('Unable to persist language preference', error);
    }
  }
};

applyEnvironment(initialCode, resolveDir(initialCode));

const setLanguage = (code) => {
  const nextCode = Object.hasOwn(DICTIONARIES, code) ? code : FALLBACK_LANG;
  const dir = resolveDir(nextCode);

  languageStore.set({ code: nextCode, dir });
  applyEnvironment(nextCode, dir);
};

const toggleLanguage = () => {
  const current = get(languageStore).code;
  const next = current === 'ar' ? 'en' : 'ar';
  setLanguage(next);
};

export const language = {
  subscribe: languageStore.subscribe,
  setLanguage,
  toggleLanguage,
};

export const direction = derived(languageStore, ($language) => $language.dir);

export const currentDictionary = derived(languageStore, ($language) => {
  return DICTIONARIES[$language.code] ?? en;
});

export const availableLanguages = [
  { code: 'en', label: en.language.english, nativeLabel: en.language.english },
  { code: 'ar', label: en.language.arabic, nativeLabel: ar.language.arabic },
];

export const dictionaries = DICTIONARIES;
