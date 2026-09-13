import {
  userProfileSchema,
  type UpdateUserProfileInput,
  type UserProfile,
} from '@/lib/entities/users/types';
import axios from 'axios';
import apiClient from '@/lib/shared/http/apiClient';

export async function getUserProfileRequest(
  signal?: AbortSignal,
): Promise<UserProfile | null> {
  const { data } = await apiClient.get('/users/profile', { signal });
  return userProfileSchema.nullable().parse(data);
}

export async function updateUserProfileRequest(
  input: UpdateUserProfileInput,
  signal?: AbortSignal,
): Promise<UserProfile> {
  try {
    const { data } = await apiClient.patch('/users/profile', input, { signal });
    return userProfileSchema.parse(data);
  } catch (error: unknown) {
    if (axios.isCancel(error)) throw error;
    const result = axios.isAxiosError<{ error?: string }>(error)
      ? error.response?.data
      : null;
    throw new Error(
      typeof result?.error === 'string'
        ? result.error
        : 'Не удалось сохранить профиль. Попробуйте ещё раз.',
    );
  }
}
