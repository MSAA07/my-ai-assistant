import assert from 'node:assert/strict';
import test from 'node:test';

import { buildUserSelection, getSelectedCount } from './userSelection.js';
import { resolveUsageLabel } from './usageLabels.js';

test('page and all-matching selections remain explicit and distinct', () => {
  assert.deepEqual(buildUserSelection({ mode: 'page', ids: ['u1', 'u1', 'u2'] }), {
    mode: 'page',
    ids: ['u1', 'u2'],
  });
  assert.deepEqual(buildUserSelection({
    mode: 'matching',
    filters: { search: '  learner  ', role: 'user', status: 'active', plan: 'premium' },
  }), {
    mode: 'matching',
    filters: { search: 'learner', role: 'user', status: 'active', plan: 'premium' },
  });
  assert.equal(getSelectedCount({ mode: 'page', ids: ['u1', 'u2'], total: 90 }), 2);
  assert.equal(getSelectedCount({ mode: 'matching', ids: [], total: 90 }), 90);
});

test('usage label props resolve real document, feature, and model names', () => {
  assert.equal(resolveUsageLabel({ document: { originalName: 'Lecture.pdf' }, documentId: 'doc_1' }, { nameKey: 'document', idKey: 'documentId' }), 'Lecture.pdf');
  assert.equal(resolveUsageLabel({ featureKey: 'exam' }, { labelKey: 'featureKey' }), 'exam');
  assert.equal(resolveUsageLabel({ model: 'gpt-5.4-mini' }, { labelKey: 'model' }), 'gpt-5.4-mini');
  assert.equal(resolveUsageLabel({ document: null, documentId: 'doc_2' }, { nameKey: 'document', idKey: 'documentId' }), 'doc_2');
});
