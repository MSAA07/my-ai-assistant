export function buildAdminUserPath(userId) {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  return `/admin/users${params.size ? `?${params.toString()}` : ''}`;
}

export function buildSecurityAccessPath(userId, { view = 'sessions', activity = 'all' } = {}) {
  const params = new URLSearchParams({ view });
  if (view === 'audit') params.set('activity', activity);
  if (userId) params.set('userId', userId);
  return `/admin/security?${params.toString()}`;
}

export function buildSessionsQuery({ limit, offset, userId = '' }) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (userId.trim()) params.set('userId', userId.trim());
  return params.toString();
}

export function buildAuditQuery({ limit, offset, action = 'all', from = '', to = '', userId = '', activity = 'all' }) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (action !== 'all') params.set('action', action);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (userId.trim()) params.set('userId', userId.trim());
  if (activity === 'admin') params.set('view', 'admin');
  return params.toString();
}

export function revokeAllConfirmation(user = {}) {
  return {
    title: 'Revoke all user sessions',
    description: `Sign ${user.email || user.name || 'this user'} out on every device?`,
    confirmLabel: 'Revoke all sessions',
    severity: 'warning',
    typedConfirmation: {
      value: 'REVOKE',
      prompt: 'Type',
      suffix: 'to revoke every session for this user.'
    }
  };
}

export async function runSecurityMutation({ request, successMessage, toastApi, onSuccess }) {
  try {
    const data = await request();
    onSuccess?.(data);
    toastApi.success(successMessage);
    return { ok: true, data };
  } catch (error) {
    toastApi.error(error?.message || 'Security action failed.');
    return { ok: false, error };
  }
}
