import test from 'node:test';
import assert from 'node:assert/strict';

import { hasRecommendations, getRiskSummary } from './recommendations.js';

test('empty recommendation lists should be treated as no data', () => {
  assert.equal(hasRecommendations([]), false);
  assert.equal(hasRecommendations(null), false);
  assert.equal(hasRecommendations(undefined), false);
});

test('risk summary counts high and moderate recommendations', () => {
  const summary = getRiskSummary([
    { urgency: 'HIGH' },
    { urgency: 'MEDIUM' },
    { urgency: 'MEDIUM' },
    { urgency: 'LOW' }
  ]);

  assert.deepEqual(summary, { high: 1, moderate: 2, low: 1 });
});
