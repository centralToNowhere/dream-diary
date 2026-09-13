const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
]);

export class DBUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Database is temporarily unavailable', { cause });
    this.name = 'DBUnavailableError';
  }
}

export function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  return CONNECTION_ERROR_CODES.has(String(error.code));
}
