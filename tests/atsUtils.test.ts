import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateAtsMatchScore,
  containsKeyword,
  weaveKeywordIntoText,
} from '../src/lib/atsUtils.ts';

test('keyword matching rejects substring false positives', () => {
  assert.equal(containsKeyword('Built a good product', 'Go'), false);
  assert.equal(containsKeyword('JavaScript applications', 'Java'), false);
  assert.equal(containsKeyword('Used Go and Java', 'Go'), true);
  assert.equal(containsKeyword('Used Go and Java', 'Java'), true);
});

test('keyword matching handles punctuation-heavy technology names', () => {
  assert.equal(containsKeyword('Services written in C++ and .NET.', 'C++'), true);
  assert.equal(containsKeyword('Services written in C++ and .NET.', '.NET'), true);
});

test('ATS analysis separates Java, JavaScript, Go, and C++ correctly', () => {
  const result = calculateAtsMatchScore(
    'Built JavaScript services and native C++ modules.',
    'Requires Java, JavaScript, Go, and C++.',
  );

  assert.deepEqual(result.matchedKeywords, ['JavaScript', 'C++']);
  assert.deepEqual(result.missingKeywords, ['Java', 'Go']);
});

test('keyword weaving does not duplicate an existing C++ skill', () => {
  const original = 'I build performance-sensitive systems with C++.';
  assert.equal(weaveKeywordIntoText(original, 'C++'), original);
});
