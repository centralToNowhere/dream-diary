'use server';

import { createUser } from '@/lib/entities/users/repository';
import { createUserInputSchema } from '@/lib/entities/users/types';

export type RegisterState = {
  error: string | null;
  success: boolean;
};

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === '23505';

export default async function registerAction(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');

  const input = createUserInputSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password,
    passwordConfirm,
  });

  if (!input.success) {
    return {
      error: input.error.issues[0]?.message ?? 'Проверьте введённые данные',
      success: false,
    };
  }

  try {
    const user = await createUser(input.data);

    return user
      ? { error: null, success: true }
      : { error: 'Не удалось создать пользователя', success: false };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        error: 'Пользователь с таким email или именем уже существует',
        success: false,
      };
    }

    console.error('Failed to register user', error);
    return {
      error: 'Не удалось создать аккаунт. Попробуй ещё раз',
      success: false,
    };
  }
}
