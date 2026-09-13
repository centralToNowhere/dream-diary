import type { UserPreferencesDTO } from '@/lib/entities/users/preferences/types';
import apiClient from '@/lib/shared/http/apiClient';

// Store initialization must not dispatch Server Actions into the navigation queue.
export default async function getUserPreferencesRequest(): Promise<UserPreferencesDTO | null> {
  const { data } = await apiClient.get<UserPreferencesDTO | null>(
    '/users/preferences',
  );
  return data;
}
