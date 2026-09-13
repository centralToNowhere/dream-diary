import 'server-only';

import query from '@/infrastructure/db/query';
import type {
  UpdateUserPreferencesInput,
  GetUserPreferencesInput,
  UpdateUserPreferencesResult,
  UserPreferencesDTO,
} from './types';

export const updateUserPreferences = async function ({
  userId,
  theme,
}: UpdateUserPreferencesInput): Promise<UpdateUserPreferencesResult | null> {
  const preferDark = theme === null ? null : theme === 'dark';

  const data = await query(
    (sql) => sql`
    INSERT INTO user_preferences (user_id, prefer_dark)
    VALUES (${userId}, ${preferDark})
    ON CONFLICT (user_id) DO UPDATE
    SET prefer_dark = EXCLUDED.prefer_dark
    RETURNING user_id;
  `,
  );

  return data[0]
    ? {
        success: true,
      }
    : null;
};

export const getUserPreferences = async function ({
  userId,
}: GetUserPreferencesInput): Promise<UserPreferencesDTO | null> {
  const data = await query(
    (sql) => sql<{ preferences: UserPreferencesDTO }[]>`
    SELECT json_build_object(
      'theme', CASE
          WHEN up.prefer_dark = true THEN 'dark'
          WHEN up.prefer_dark = false THEN 'light'
          ELSE NULL
        END
    ) AS preferences
    FROM user_preferences AS up
    WHERE up.user_id = ${userId};
  `,
  );

  return data[0]?.preferences ?? null;
};
