export function buildUserSelection({ mode = 'page', ids = [], filters = {} } = {}) {
  if (mode === 'matching') {
    return {
      mode: 'matching',
      filters: {
        search: String(filters.search || '').trim(),
        role: filters.role || 'all',
        status: filters.status || 'all',
        plan: filters.plan || 'all',
      },
    };
  }

  return {
    mode: 'page',
    ids: [...new Set(ids.filter(Boolean))],
  };
}

export function getSelectedCount({ mode = 'page', ids = [], total = 0 } = {}) {
  return mode === 'matching' ? Number(total || 0) : ids.length;
}
