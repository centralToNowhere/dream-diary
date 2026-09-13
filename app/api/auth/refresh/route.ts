import cookiesUtils, {
  JWT_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/lib/shared/auth/cookies/cookiesUtils';
import { refreshByToken } from '@/lib/features/auth/refresh';
import { type NextRequest, NextResponse } from 'next/server';

const sessionExpiredResponse = () => {
  const response = NextResponse.json(
    { error: 'Сессия завершена. Войдите снова.' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } },
  );

  response.cookies.delete(JWT_TOKEN_KEY);
  response.cookies.delete(REFRESH_TOKEN_KEY);

  return response;
};

export const POST = async (request: NextRequest) => {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) {
    return sessionExpiredResponse();
  }

  const data = await refreshByToken(refreshToken);

  if (!data) {
    return sessionExpiredResponse();
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );

  await cookiesUtils.setJWT(
    {
      token: data.jwt,
      expires: data.jwtExpires,
    },
    response.cookies,
  );

  return response;
};
