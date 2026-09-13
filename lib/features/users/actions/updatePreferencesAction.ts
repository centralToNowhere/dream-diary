'use server';

import type {
  UpdateUserPreferencesResult,
  UserPreferences,
} from '@/lib/entities/users/preferences/types';
import { updateUserPreferences } from '@/lib/entities/users/preferences/repository';
import loginRequired from '@/lib/entities/users/loginRequired';
import { preferencesThemeSchema } from '@/lib/shared/theme/types';

export async function updatePreferencesAction(
  preferences: UserPreferences,
): Promise<UpdateUserPreferencesResult> {
  const user = await loginRequired();
  const theme = preferencesThemeSchema.parse(preferences.theme);
  const result = await updateUserPreferences({
    userId: user.id,
    theme,
  });

  if (!result) {
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}

export default updatePreferencesAction;
