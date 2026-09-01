import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAdminUserPath,
  buildAuditQuery,
  buildSecurityAccessPath,
  buildSessionsQuery,
  revokeAllConfirmation,
  runSecurityMutation
} from './securityAccess.js';

test('security cross-links preserve the requested subview and user filter', () => {
  assert.equal(buildAdminUserPath('user 1'), '/admin/users?userId=user+1');
  assert.equal(
    buildSecurityAccessPath('user 1', { view: 'audit', activity: 'admin' }),
    '/admin/security?view=audit&activity=admin&userId=user+1'
  );
});

test('session and audit queries include real pagination and filters', () => {
  assert.equal(buildSessionsQuery({ limit: 25, offset: 50, userId: 'u1' }), 'limit=25&offset=50&userId=u1');
  const params = new URLSearchParams(buildAuditQuery({ limit: 25, offset: 25, action: 'SET_ROLE', from: '2026-09-01', to: '2026-09-02', userId: 'u1', activity: 'admin' }));
  assert.deepEqual(Object.fromEntries(params), { limit: '25', offset: '25', action: 'SET_ROLE', from: '2026-09-01', to: '2026-09-02', userId: 'u1', view: 'admin' });
});

test('bulk revoke uses the typed-word confirmation gate', () => {
  const config = revokeAllConfirmation({ email: 'learner@example.com' });
  assert.equal(config.severity, 'warning');
  assert.equal(config.typedConfirmation.value, 'REVOKE');
});

test('failed revoke surfaces an error toast and does not run optimistic success', async () => {
  const calls = [];
  const result = await runSecurityMutation({
    request: async () => { throw new Error('Failed to revoke session'); },
    successMessage: 'Session revoked.',
    toastApi: { success: (message) => calls.push(['success', message]), error: (message) => calls.push(['error', message]) },
    onSuccess: () => calls.push(['optimistic'])
  });
  assert.equal(result.ok, false);
  assert.deepEqual(calls, [['error', 'Failed to revoke session']]);
});
