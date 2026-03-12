const cache = new Map();

export function readPageCache(key) {
  return cache.get(key) ?? null;
}

export function writePageCache(key, value) {
  cache.set(key, {
    ...value,
    cachedAt: Date.now()
  });
}

export function clearPageCache(key) {
  cache.delete(key);
}
