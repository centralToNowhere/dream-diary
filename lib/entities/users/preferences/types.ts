import { z } from 'zod';
import { preferencesThemeSchema } from '@/lib/shared/theme/types';

const userPreferencesSchema = z.object({
  theme: preferencesThemeSchema.nullable(),
});

const updateUserPreferencesInputSchema = userPreferencesSchema.extend({
  userId: z.number(),
});

const getUserPreferencesInputSchema = z.object({
  userId: z.number(),
});

export type PreferencesTheme = z.infer<typeof preferencesThemeSchema>;
export type UserPreferencesDTO = z.infer<typeof userPreferencesSchema>;
export type UserPreferences = {
  theme: NonNullable<UserPreferencesDTO['theme']>;
};
export type UpdateUserPreferencesInput = z.infer<
  typeof updateUserPreferencesInputSchema
>;
export type UpdateUserPreferencesResult = {
  success: boolean;
};
export type GetUserPreferencesInput = z.infer<
  typeof getUserPreferencesInputSchema
>;

export const isPreferencesTheme = (
  theme: string,
): theme is PreferencesTheme => {
  return preferencesThemeSchema.safeParse(theme)?.success;
};
