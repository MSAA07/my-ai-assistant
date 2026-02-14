import { writable, derived } from 'svelte/store';

function createRouter() {
  const { subscribe, set } = writable(parseHash());

  function parseHash() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');
    return { path, params: Object.fromEntries(params) };
  }

  function navigate(path) {
    window.location.hash = path;
  }

  window.addEventListener('hashchange', () => {
    set(parseHash());
  });

  return {
    subscribe,
    navigate,
  };
}

export const router = createRouter();

export const currentPath = derived(router, ($router) => $router.path);
export const routeParams = derived(router, ($router) => $router.params);
