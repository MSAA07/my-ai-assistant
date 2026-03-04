import { get } from 'svelte/store';
import en from './en.js';
import ar from './ar.js';
import { language } from '../stores/language.js';

export const dictionaries = { en, ar };
const missingKeys = new Set();
const isDev = Boolean(import.meta?.env?.DEV);

function resolvePath(obj, path) {
  return path.split('.').reduce((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in acc) {
      return acc[segment];
    }
    return undefined;
  }, obj);
}

function format(template, vars) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (vars && key in vars) {
      return vars[key];
    }
    return `{${key}}`;
  });
}

function warnMissing(locale, key) {
  if (!isDev) return;
  const signature = `${locale}:${key}`;
  if (missingKeys.has(signature)) return;
  missingKeys.add(signature);
  console.warn(`[i18n] Missing ${locale} translation for "${key}"`);
}

export function t(path, vars = {}) {
  const lang = get(language);
  const locales = dictionaries[lang] ?? en;

  const value = resolvePath(locales, path);
  if (value !== undefined) {
    return format(value, vars);
  }

  if (lang !== 'en') {
    warnMissing(lang, path);
  }

  const fallback = resolvePath(en, path);
  if (fallback !== undefined) {
    return format(fallback, vars);
  }

  warnMissing('en', path);
  return path;
}

export function registerDictionary(code, dict) {
  dictionaries[code] = dict;
}
