import { NextResponse, type NextRequest } from 'next/server';
import { parseJWT } from "@/features/auth/jwt"
import { PUBLIC_ROUTES, SESSION_EXPIRED_URL } from './app/routes';
import { getSessionByToken } from './features/auth/getUserProfile';
import { refreshByToken } from './features/auth/refresh';
import cookiesUtils from './features/auth/cookies/cookiesUtils';
import {
  serializeUserData,
  USER_DATA_HEADER,
} from './features/auth/userDataHeader';
import type { UserProfile } from './entities/users/types';

const publicRoutes = new Set(PUBLIC_ROUTES);
const SERVER_ACTION_HEADER = "next-action";
type AuthMode = "optional" | "required";

const continueRequest = (request: NextRequest, user?: UserProfile) => {
  const requestHeaders = new Headers(request.headers);

  // Никогда не доверяем x-user-data, пришедшему от клиента.
  requestHeaders.delete(USER_DATA_HEADER);

  if (user) {
    requestHeaders.set(USER_DATA_HEADER, serializeUserData(user));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
};

const sessionExpiredResponse = async (request: NextRequest) => {
  const response = NextResponse.redirect(
    new URL(SESSION_EXPIRED_URL, request.url),
    303,
  );

  await cookiesUtils.removeJWT(response.cookies);
  await cookiesUtils.removeRefreshToken(response.cookies)

  return response;
}

const continueAsGuest = async (request: NextRequest) => {
  await cookiesUtils.removeJWT(request.cookies);
  await cookiesUtils.removeRefreshToken(request.cookies)

  const response = continueRequest(request);

  await cookiesUtils.removeJWT(response.cookies);
  await cookiesUtils.removeRefreshToken(response.cookies)

  return response;
};

const authenticationFailedResponse = (
  request: NextRequest,
  mode: AuthMode,
) => (
  mode === "optional"
    ? continueAsGuest(request)
    : sessionExpiredResponse(request)
);

const refresh = async (
  request: NextRequest,
  refreshToken: string,
  mode: AuthMode,
) => {
  const refreshedSession = await refreshByToken(refreshToken);

  if (!refreshedSession) {
    return authenticationFailedResponse(request, mode);
  }

  const user = parseJWT(refreshedSession.jwt);

  if (!user) {
    return authenticationFailedResponse(request, mode);
  }

  await cookiesUtils.setJWT({
    token: refreshedSession.jwt,
    expires: refreshedSession.jwtExpires,
  }, request.cookies);

  const response = continueRequest(request, user);

  await cookiesUtils.setJWT({
    token: refreshedSession.jwt,
    expires: refreshedSession.jwtExpires,
  }, response.cookies);

  return response;
}

const sessionCheck = async (
  request: NextRequest,
  mode: AuthMode,
): Promise<NextResponse<unknown>> => {
  const accessToken = await cookiesUtils.getJWT(request.cookies);
  const refreshToken = await cookiesUtils.getRefreshToken(request.cookies);

  if (accessToken) {
    const user = await getSessionByToken(accessToken);

    if (user) {
      return continueRequest(request, user);
    }
  }

  if (refreshToken) {
    return refresh(request, refreshToken, mode);
  }

  if (accessToken) {
    return authenticationFailedResponse(request, mode);
  }

  if (mode === "optional") {
    return continueRequest(request);
  }

  return NextResponse.redirect(new URL("/login", request.url), 303);
}

export async function proxy(request: NextRequest) {
  const { nextUrl, method } = request;
  const isApiRequest = nextUrl.pathname.startsWith("/api/");
  const isPageRequest = method === "GET" || method === "HEAD";
  const isServerActionRequest = method === "POST"
    && request.headers.has(SERVER_ACTION_HEADER);

  // API использует loginRequiredApi и собственный 401 -> refresh -> retry flow.
  if (isApiRequest || (!isPageRequest && !isServerActionRequest)) {
    return continueRequest(request);
  }

  const mode: AuthMode = publicRoutes.has(nextUrl.pathname)
    ? "optional"
    : "required";

  try {
    return await sessionCheck(request, mode);
  } catch (error: unknown) {
    console.error("[proxy] request failed", {
      method: method,
      pathname: nextUrl.pathname,
      error,
    });

    const errorUrl = nextUrl.clone();
    errorUrl.pathname = "/500.html";
    errorUrl.search = "";

    return NextResponse.rewrite(errorUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
