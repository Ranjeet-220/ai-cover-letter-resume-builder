import assert from 'node:assert/strict';
import test from 'node:test';

import { BadRequestError, readObjectBody } from '../src/server/validation.ts';

function request(body: string): Request {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
}

test('JSON request validation rejects malformed bodies and wrong field types', async () => {
  const fields = { text: 'string', skills: 'string-or-string-array' } as const;
  for (const body of ['{', 'null', '[]', '42', '{"text":42}', '{"skills":["React",7]}']) {
    await assert.rejects(readObjectBody(request(body), fields), BadRequestError);
  }
  assert.deepEqual(
    await readObjectBody(request('{"text":"Hello","skills":["React"]}'), fields),
    { text: 'Hello', skills: ['React'] },
  );
});
