import z from 'zod';

export const preferencesThemeSchema = z.union([
  z.literal('light'),
  z.literal('dark'),
]);

export const appThemeSchema = z.union([...preferencesThemeSchema.options]);

export type Theme = z.infer<typeof appThemeSchema>;

export const isAppThemeSchema = (theme: string): theme is Theme => {
  const res = appThemeSchema.safeParse(theme);

  return res.success;
};
