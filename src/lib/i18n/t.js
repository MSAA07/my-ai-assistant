import { get } from 'svelte/store';
import { currentDictionary, dictionaries, language } from '../stores/language.js';
import en from './en.js';

const lookup = (dictionary, key) => {
  return key.split('.').reduce((accumulator, part) => {
    if (accumulator && Object.hasOwn(accumulator, part)) {
      return accumulator[part];
    }
    return undefined;
  }, dictionary);
};

const interpolate = (value, replacements = {}) => {
  return Object.entries(replacements).reduce((output, [token, replacement]) => {
    const pattern = new RegExp(`{{\\s*${token}\\s*}}`, 'g');
    return output.replace(pattern, replacement);
  }, value);
};

export const t = (key, replacements = {}) => {
  const activeDictionary = get(currentDictionary);
  const rawValue = lookup(activeDictionary, key) ?? lookup(en, key) ?? key;

  if (typeof rawValue !== 'string') {
    return rawValue;
  }

  return interpolate(rawValue, replacements);
};

export const getLanguageCode = () => get(language).code;

export { dictionaries };
