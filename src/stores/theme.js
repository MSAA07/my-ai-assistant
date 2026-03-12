import { writable } from 'svelte/store';

export const THEME_STORAGE_KEY = 'my-ai-assistant:theme';
export const DEFAULT_THEME = 'dark';
const THEMES = new Set(['dark', 'light']);

function normalizeTheme(value) {
  return THEMES.has(value) ? value : DEFAULT_THEME;
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;

  const nextTheme = normalizeTheme(theme);
  document.documentElement.setAttribute('data-theme', nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
}

function readStoredTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

function persistTheme(theme) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures to keep theme switching functional.
  }
}

function createThemeStore() {
  const { subscribe, set } = writable(DEFAULT_THEME);
  let currentTheme = DEFAULT_THEME;

  subscribe((value) => {
    currentTheme = value;
  });

  function setTheme(theme) {
    const nextTheme = normalizeTheme(theme);
    set(nextTheme);
    applyTheme(nextTheme);
    persistTheme(nextTheme);
    return nextTheme;
  }

  function toggleTheme() {
    return setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  function initializeTheme() {
    const initialTheme = readStoredTheme();
    set(initialTheme);
    applyTheme(initialTheme);
    return initialTheme;
  }

  return {
    subscribe,
    initializeTheme,
    setTheme,
    toggleTheme
  };
}

export const theme = createThemeStore();
