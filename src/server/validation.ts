export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

type FieldType = 'string' | 'string-or-string-array';

export async function readObjectBody<T>(
  request: Request,
  fields: Record<string, FieldType>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BadRequestError('Request body must contain valid JSON.');
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestError('Request body must be a JSON object.');
  }

  const values = body as Record<string, unknown>;
  for (const [name, type] of Object.entries(fields)) {
    const value = values[name];
    if (value === undefined) continue;
    const valid = typeof value === 'string' ||
      (type === 'string-or-string-array' && Array.isArray(value) && value.every((item) => typeof item === 'string'));
    if (!valid) throw new BadRequestError(`${name} must be ${type === 'string' ? 'a string' : 'a string or an array of strings'}.`);
  }

  return values as T;
}
