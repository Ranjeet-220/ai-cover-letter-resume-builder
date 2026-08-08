import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateReadTime,
  calculateWordCount,
  cn,
  formatDate,
} from '../src/lib/utils.ts';

test('formatDate renders ISO dates as readable strings', () => {
  assert.equal(formatDate('2026-01-15T10:30:00Z'), 'Jan 15, 2026');
});

test('formatDate returns input unchanged for invalid dates', () => {
  assert.equal(formatDate('not-a-date'), 'not-a-date');
  assert.equal(formatDate(''), '');
});

test('calculateWordCount counts words and handles empty input', () => {
  assert.equal(calculateWordCount('hello world'), 2);
  assert.equal(calculateWordCount('  spaced   out  '), 2);
  assert.equal(calculateWordCount(''), 0);
  assert.equal(calculateWordCount('   '), 0);
});

test('calculateReadTime rounds up to at least 1 minute', () => {
  assert.equal(calculateReadTime('one two three'), 1);
  assert.equal(calculateReadTime(''), 0);
  assert.equal(calculateReadTime('word '.repeat(400)), 2);
});

test('cn merges conditional class names', () => {
  assert.equal(cn('base', false && 'hidden', 'extra'), 'base extra');
});
