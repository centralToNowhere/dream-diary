import 'server-only';

import { headers } from 'next/headers';
import { cache } from 'react';

export const USER_DATA_HEADER = 'x-user-data';

export const serializeData = (user: Record<string, unknown>) =>
  Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');

export const deserializeData = (
  value?: string | null,
): Record<string, unknown> | null => {
  if (!value) {
    return null;
  }

  try {
    const json = Buffer.from(value, 'base64url').toString('utf8');

    const data: unknown = JSON.parse(json);

    return typeof data === 'object' && data !== null && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

export const getDataFromRequest = cache(async () => {
  const requestHeaders = await headers();

  return deserializeData(requestHeaders.get(USER_DATA_HEADER));
});
