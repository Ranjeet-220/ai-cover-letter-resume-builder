import assert from 'node:assert/strict';
import test from 'node:test';

import { getErrorMessage, isRecord } from '../src/lib/errors.ts';

test('getErrorMessage extracts message from Error instances', () => {
  assert.equal(getErrorMessage(new Error('boom'), 'fallback'), 'boom');
});

test('getErrorMessage falls back for non-Error values', () => {
  assert.equal(getErrorMessage('oops', 'fallback'), 'fallback');
  assert.equal(getErrorMessage(null, 'fallback'), 'fallback');
  assert.equal(getErrorMessage(undefined, 'fallback'), 'fallback');
  assert.equal(getErrorMessage(new Error(''), 'fallback'), 'fallback');
});

test('isRecord detects plain objects only', () => {
  assert.equal(isRecord({ a: 1 }), true);
  assert.equal(isRecord([]), false);
  assert.equal(isRecord(null), false);
  assert.equal(isRecord('string'), false);
});
