import assert from 'node:assert/strict';
import test from 'node:test';

import { getFreeGenerationsRemaining, incrementUsageCount } from '../src/lib/usage.ts';

test('remaining generations include purchased credits and unused free generations', () => {
  const values = new Map<string, string>([
    ['covercraft_credits', '2'],
    ['covercraft_free_generations_used', '1'],
  ]);
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.localStorage;
  const previousCustomEvent = globalThis.CustomEvent;
  Object.assign(globalThis, {
    window: { dispatchEvent() {} },
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });

  try {
    assert.equal(getFreeGenerationsRemaining(), 6);
    Object.assign(globalThis, { CustomEvent: class {} });
    incrementUsageCount();
    assert.equal(getFreeGenerationsRemaining(), 5);
    assert.equal(values.get('covercraft_credits'), '1');
  } finally {
    Object.assign(globalThis, {
      window: previousWindow,
      localStorage: previousStorage,
      CustomEvent: previousCustomEvent,
    });
  }
});
