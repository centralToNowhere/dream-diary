import { RequestCookies, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

type CookieWriter = ResponseCookies | RequestCookies;

type TokenData = {
  token: string
  expires: Date
}

export const JWT_TOKEN_KEY = 'jwt';
export const REFRESH_TOKEN_KEY = 'refreshToken';

export const setTokenHttpOnly = async (key: string, data: TokenData, cookieWriter?: CookieWriter) => {
  const cookieStore = cookieWriter ? cookieWriter : await cookies();

  cookieStore.set(key, data.token, {
    ...cookieOptions,
    expires: data.expires,
  })
}

export const getToken = async (key: string, cookieWriter?: CookieWriter) => {
  const cookieStore = cookieWriter ? cookieWriter : await cookies();

  return cookieStore.get(key)?.value;
}

export const removeToken = async (key: string, cookieWriter?: CookieWriter) => {
  const cookieStore = cookieWriter ? cookieWriter : await cookies();

  cookieStore.delete(key);
}

const setJWT = setTokenHttpOnly.bind(null, JWT_TOKEN_KEY);
const setRefreshToken = setTokenHttpOnly.bind(null, REFRESH_TOKEN_KEY);
const getJWT = getToken.bind(null, JWT_TOKEN_KEY);
const getRefreshToken = getToken.bind(null, REFRESH_TOKEN_KEY);
const removeJWT = removeToken.bind(null, JWT_TOKEN_KEY);
const removeRefreshToken = removeToken.bind(null, REFRESH_TOKEN_KEY);

export default {
  setJWT,
  setRefreshToken,
  getJWT,
  getRefreshToken,
  removeJWT,
  removeRefreshToken
}
