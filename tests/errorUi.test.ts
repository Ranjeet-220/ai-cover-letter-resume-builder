import assert from 'node:assert/strict';
import test from 'node:test';

import { getErrorMessage, isRecord } from '../src/lib/errors.ts';

test('getErrorMessage handles nested error shapes and edge cases', () => {
  assert.equal(getErrorMessage(new TypeError('Invalid type'), 'default'), 'Invalid type');
  assert.equal(getErrorMessage(new RangeError('Out of bounds'), 'default'), 'Out of bounds');
  assert.equal(getErrorMessage({ message: 'custom' }, 'default'), 'default');
  assert.equal(getErrorMessage(0, 'default'), 'default');
  assert.equal(getErrorMessage(false, 'default'), 'default');
});

test('isRecord accurately differentiates object types', () => {
  assert.equal(isRecord({}), true);
  assert.equal(isRecord({ key: 'val' }), true);
  assert.equal(isRecord(Object.create(null)), true);
  assert.equal(isRecord(new Date()), true);
  assert.equal(isRecord(() => {}), false);
  assert.equal(isRecord(123), false);
  assert.equal(isRecord(NaN), false);
  assert.equal(isRecord(undefined), false);
});
