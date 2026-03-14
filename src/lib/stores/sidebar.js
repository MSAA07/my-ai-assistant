import { writable } from 'svelte/store';

const STORAGE_KEY = 'layout.sidebarCollapsed';
const isBrowser = typeof window !== 'undefined';

function readStoredValue() {
  if (!isBrowser) return false;

  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

const sidebarCollapsedStore = writable(readStoredValue());

sidebarCollapsedStore.subscribe((collapsed) => {
  if (!isBrowser) return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
  } catch {
    // Ignore storage failures so layout state remains in-memory.
  }
});

export const sidebarCollapsed = sidebarCollapsedStore;

export function toggleSidebarCollapsed() {
  sidebarCollapsedStore.update((collapsed) => !collapsed);
}
