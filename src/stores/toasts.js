import { writable } from 'svelte/store';

const DEFAULT_DURATION_MS = 4500;
let nextToastId = 1;
const timers = new Map();

export const toasts = writable([]);

export function dismissToast(id) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  toasts.update((items) => items.filter((item) => item.id !== id));
}

export function showToast({ type = 'success', title = '', message = '', duration = DEFAULT_DURATION_MS }) {
  const id = nextToastId++;
  const toast = {
    id,
    type: type === 'error' ? 'error' : 'success',
    title,
    message,
  };

  toasts.update((items) => [...items, toast]);

  if (duration > 0 && typeof window !== 'undefined') {
    timers.set(id, window.setTimeout(() => dismissToast(id), duration));
  }

  return id;
}

export const toast = {
  success(message, options = {}) {
    return showToast({ ...options, type: 'success', message });
  },
  error(message, options = {}) {
    return showToast({ ...options, type: 'error', message });
  },
};
