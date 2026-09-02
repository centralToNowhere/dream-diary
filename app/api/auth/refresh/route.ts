import cookiesUtils, {
  JWT_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/features/auth/cookies/cookiesUtils';
import { refreshByToken } from '@/features/auth/refresh'
import { type NextRequest, NextResponse } from "next/server";

const sessionExpiredResponse = (request: NextRequest) => {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("session-expired", "true");
  const response = NextResponse.redirect(loginUrl, 303);

  response.cookies.delete(JWT_TOKEN_KEY);
  response.cookies.delete(REFRESH_TOKEN_KEY);

  return response;
};

export const POST = async (request: NextRequest) => {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) {
    return sessionExpiredResponse(request);
  }

  const data = await refreshByToken(refreshToken);

  if (!data) {
    return sessionExpiredResponse(request);
  }

  const response = NextResponse.json({ success: true });

  await cookiesUtils.setJWT({
    token: data.jwt,
    expires: data.jwtExpires,
  }, response.cookies);

  return response;
}
