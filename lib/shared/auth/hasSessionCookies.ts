import type { NextRequest } from 'next/server';
import { JWT_TOKEN_KEY, REFRESH_TOKEN_KEY } from './cookies/cookiesUtils';

export default function hasSessionCookies(request: NextRequest) {
  return (
    request.cookies.has(JWT_TOKEN_KEY) || request.cookies.has(REFRESH_TOKEN_KEY)
  );
}
