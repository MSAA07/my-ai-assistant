import { writable, derived } from 'svelte/store';

function createRouter() {
  const { subscribe, set } = writable(parseHash());

  function parseHash() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');
    return { path, params: Object.fromEntries(params) };
  }

  function updateHash(path, { replace = false } = {}) {
    const nextHash = `#${path}`;
    if (replace) {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}${nextHash}`);
      set(parseHash());
      return;
    }

    window.location.hash = path;
  }

  function navigate(path, options) {
    updateHash(path, options);
  }

  function replace(path) {
    updateHash(path, { replace: true });
  }

  window.addEventListener('hashchange', () => {
    set(parseHash());
  });

  return {
    subscribe,
    navigate,
    replace,
  };
}

export const router = createRouter();

export const currentPath = derived(router, ($router) => $router.path);
export const routeParams = derived(router, ($router) => $router.params);
