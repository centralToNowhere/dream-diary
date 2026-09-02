import getEnv from '@/utilities/getEnv'
import crypto from "node:crypto";
import { UserAuthData } from '@/entities/users/types';
import { userJWTPayloadScheme } from './types'

const JWT_SECRET = getEnv('JWT_SECRET');
const JWT_EXPIRES_MINUTES = Number(getEnv('ACCESS_TOKEN_EXPIRES_MINUTES'));

export const getExpirationDateFromNow = () => {
  return Date.now() + (JWT_EXPIRES_MINUTES * 60 * 1000);
}

export const createJWT = (userData: UserAuthData, sessionId: number) => {
  const exp = getExpirationDateFromNow();
  const head = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'jwt' })
  ).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...userData,
      exp: Math.floor(exp / 1000),
      sId: sessionId,
      jti: crypto.randomBytes(32).toString("base64url")
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('SHA256', JWT_SECRET)
    .update(`${head}.${body}`)
    .digest('base64url');

  return {
    jwt: `${head}.${body}.${signature}`,
    jwtExpires: new Date(exp)
  };
}

export const parseJWT = (jwt: string): UserAuthData | null => {
  try {
    const tokenParts = jwt.split('.');

    if (tokenParts.length !== 3) {
      return null;
    }

    const head = tokenParts[0];
    const body = tokenParts[1];
    const signaturePart = tokenParts[2];

    const signature = crypto
      .createHmac('SHA256', JWT_SECRET)
      .update(`${head}.${body}`)
      .digest('base64url');

    if (signature !== signaturePart) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(
        body,
        'base64url'
      ).toString('utf8')
    );

    const parseResult = userJWTPayloadScheme.safeParse(payload);

    if (
      !parseResult.success
      || parseResult.data.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const { id, name, email, roleName } = parseResult.data;

    return { id, name, email, roleName };
  } catch {
    return null;
  }
}
