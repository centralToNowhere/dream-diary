import getEnv from '@/utilities/getEnv';
import query from '@/infrastructure/db/query';
import crypto from 'node:crypto';
import { UserAuthData } from '@/lib/entities/users/types';
import { SessionDTO, SessionRefreshResponse } from './types';
import { createJWT } from '@/lib/shared/auth/jwt';

function createToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const createSession = async function (
  userData: UserAuthData,
): Promise<SessionDTO | null> {
  const refreshTokenExpiresDays = Number(getEnv('REFRESH_TOKEN_EXPIRES_DAYS'));

  const refreshToken = createToken();
  const refreshTokenHash = hashToken(refreshToken);

  const result = await query(
    (sql) => sql`
    INSERT INTO sessions AS s (user_id, refresh_token_hash, refresh_expires_at)
    VALUES (
      ${userData.id},
      ${refreshTokenHash},
      NOW() + ${refreshTokenExpiresDays} * INTERVAL '1 day'
    ) RETURNING
        s.id,
        s.refresh_expires_at AS "refreshTokenExpires";
  `,
  );

  const sessionData = result[0];

  if (!sessionData) {
    return null;
  }

  const { jwt, jwtExpires } = createJWT(userData, sessionData.id);

  const session: SessionDTO = {
    id: sessionData.id,
    jwt,
    jwtExpires,
    refreshToken: refreshToken,
    refreshTokenExpires: sessionData.refreshTokenExpires,
  };

  return session;
};

export const refreshSession = async function (
  refreshToken: string,
): Promise<SessionRefreshResponse | null> {
  const refreshTokenHash = hashToken(refreshToken);

  const result = await query(
    (sql) => sql`
    SELECT
      s.id AS "sessionId",
      u.id AS "userId",
      u.email,
      u.username AS name,
      json_build_object('type', r.code, 'title', r.title) AS "roleName"
    FROM sessions s
    INNER JOIN users u
      ON u.id = s.user_id
    INNER JOIN roles r
      ON r.id = u.role_id
    WHERE
      s.refresh_token_hash = ${refreshTokenHash}
      AND s.refresh_expires_at > NOW();
  `,
  );

  const sessionData = result[0];

  if (!result.count || !sessionData) {
    return null;
  }

  const user: UserAuthData = {
    id: sessionData.userId,
    name: sessionData.name,
    email: sessionData.email,
    roleName: sessionData.roleName,
  };

  const { jwt, jwtExpires } = createJWT(user, sessionData.sessionId);

  return {
    userId: sessionData.userId,
    jwt,
    jwtExpires,
  };
};

export const deleteSession = async function (refreshToken: string) {
  const refreshTokenHash = hashToken(refreshToken);

  await query(
    (sql) => sql`
    DELETE FROM sessions
    WHERE refresh_token_hash = ${refreshTokenHash}
  `,
  );
};
