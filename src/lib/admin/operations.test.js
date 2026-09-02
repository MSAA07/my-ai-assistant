import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildIncidentsQuery,
  buildJobsQuery,
  formatCodexBrief,
  optimisticIncidentTransition,
  selectedIncidents
} from './operations.js';

const incidents = [
  { id: 'sentry:1', source: 'sentry', sourceGroup: 'sentry', severity: 'critical', status: 'open', title: 'Timeout', message: 'Provider timed out', createdAt: '2026-09-02T10:00:00.000Z' },
  { id: 'job:2', source: 'job', sourceGroup: 'job', severity: 'warning', status: 'resolved', title: 'Job failed', message: 'Parser failed', createdAt: '2026-09-02T09:00:00.000Z' }
];

test('operations queries carry real pagination and scoped filters', () => {
  assert.equal(buildIncidentsQuery({ page: 2, source: 'sentry', severity: 'critical', includeResolved: true }), 'page=2&limit=25&source=sentry&severity=critical&includeResolved=true');
  assert.equal(buildJobsQuery({ page: 3, search: 'timeout', stuckOnly: true }), 'page=3&limit=25&search=timeout&stuckOnly=true');
});

test('Copy for Codex preview follows the current selection and clears when empty', () => {
  const first = formatCodexBrief(selectedIncidents(incidents, new Set(['sentry:1'])));
  const second = formatCodexBrief(selectedIncidents(incidents, new Set(['job:2'])));
  const empty = formatCodexBrief(selectedIncidents(incidents, new Set()));

  assert.match(first, /Title: Timeout/);
  assert.doesNotMatch(second, /Timeout/);
  assert.match(second, /Title: Job failed/);
  assert.equal(empty, '');
});

test('optimistic resolve and reopen update the live open KPI immediately', () => {
  const resolved = optimisticIncidentTransition({ incidents, ids: ['sentry:1'], status: 'resolved', includeResolved: false, openCount: 4 });
  assert.equal(resolved.openCount, 3);
  assert.equal(resolved.incidents.some((incident) => incident.id === 'sentry:1'), false);

  const reopened = optimisticIncidentTransition({ incidents, ids: ['job:2'], status: 'open', includeResolved: true, openCount: 3 });
  assert.equal(reopened.openCount, 4);
  assert.equal(reopened.incidents.find((incident) => incident.id === 'job:2').status, 'open');
});
