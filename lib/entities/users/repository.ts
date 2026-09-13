import query from '@/infrastructure/db/query';
import type {
  CreateUserInput,
  CreateUserDto,
  LoginUserData,
  UserProfile,
  UpdateUserProfileInput,
} from './types';
import { hashPassword } from './hashUtils';

export const createUser = async function ({
  name,
  email,
  password,
}: CreateUserInput): Promise<CreateUserDto | null> {
  const passwordHash = await hashPassword(password);

  const data = await query(
    (sql) => sql<CreateUserDto[]>`
    WITH user_role AS (
        SELECT id FROM roles WHERE code = 'user'
    )
    INSERT INTO users AS u (role_id, username, email, password_hash)
    SELECT user_role.id, ${name}, ${email}, ${passwordHash}
    FROM user_role
    RETURNING u.id, u.username AS name, u.email, (
        SELECT r.title
        FROM roles AS r
        WHERE r.id = u.role_id
    ) AS roleName;
  `,
  );

  return data[0] ? data[0] : null;
};

export const getUserDataByEmail = async function (
  email: string,
): Promise<LoginUserData | null> {
  const data = await query(
    (sql) => sql<LoginUserData[]>`
    SELECT
      u.id,
      u.username AS name,
      u.email,
      u.password_hash,
      json_build_object('type', r.code, 'title', r.title) AS "roleName"
    FROM users u
    INNER JOIN roles r
      ON u.role_id = r.id
    WHERE u.email = ${email};
  `,
  );

  return data[0] ? data[0] : null;
};

export async function getUserProfileById(
  userId: number,
): Promise<UserProfile | null> {
  const data = await query(
    (sql) => sql<UserProfile[]>`
    SELECT u.id, u.username AS name, u.email, u.avatar_url AS "avatarUrl",
      json_build_object('type', r.code, 'title', r.title) AS "roleName"
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.id = ${userId};
  `,
  );

  return data[0] ?? null;
}

export async function updateUserProfile(
  userId: number,
  input: UpdateUserProfileInput,
): Promise<UserProfile | null> {
  const data = await query(
    (sql) => sql<UserProfile[]>`
    UPDATE users AS u
    SET username = ${input.name}, email = ${input.email}, updated_at = NOW()
    FROM roles AS r
    WHERE u.id = ${userId} AND r.id = u.role_id
    RETURNING u.id, u.username AS name, u.email, u.avatar_url AS "avatarUrl",
      json_build_object('type', r.code, 'title', r.title) AS "roleName";
  `,
  );

  return data[0] ?? null;
}
