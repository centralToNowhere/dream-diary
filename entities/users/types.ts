import { z } from 'zod';

export const roleUserSchema = z.object({
  type: z.literal("user"),
  title: z.string(),
});

export const roleAdminSchema = z.object({
  type: z.literal("admin"),
  title: z.string(),
});

export const userRoleSchema = z.discriminatedUnion("type", [
  roleUserSchema,
  roleAdminSchema,
]);

export const createUserSchema = z.object({
  id: z.number().int().positive(),
  roleName: z.string(),
  name: z.string(),
  email: z.email(),
});

export const LoginInputSchema = z.object({
  email: z.email({ message: "Введите email" }),
  password: z.string().min(1, "Введите пароль"),
})

export const loginUserScheme = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  password_hash: z.string(),
  roleName: userRoleSchema,
})
export type LoginUserData = z.infer<typeof loginUserScheme>;

export const userAuthScheme = loginUserScheme.omit({ password_hash: true })
export type UserAuthData = z.infer<typeof userAuthScheme>;

export type LoginUserResultDTO = {
  jwt: string
  jwtExpires: Date
  refreshToken: string
  refreshTokenExpires: Date
}

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const UserProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  roleName: userRoleSchema,
  avatarUrl: z.url().nullable().optional(),
});

export type UserProfileDTO = z.infer<typeof UserProfileSchema>;

export type UserProfile = UserProfileDTO;

export const createUserInputSchema = z.object({
  name: z.string().trim().min(3, "Имя должно содержать минимум 3 символа").max(50),
  email: z.email("Укажи корректный email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов").max(256),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"]
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type LoginUserInput = z.infer<typeof LoginInputSchema>;
