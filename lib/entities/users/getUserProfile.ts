import { UserProfile } from '@/lib/entities/users/types';
import { cache } from 'react';
import cookiesUtils from '../../shared/auth/cookies/cookiesUtils';
import { getDataFromRequest } from '../../shared/auth/userDataHeader';
import { userProfileSchema } from './types';
import { parseJWT } from '@/lib/shared/auth/jwt';

/**
 * Серверная функция: возвращает текущего пользователя или null,
 * если его не удалось определить.
 * Не перенаправляет на страницу входа: вызывающий код сам обрабатывает гостя.
 *
 * Использовать, когда авторизация необязательна, например в шапке приложения
 * или при чтении настроек с системными значениями для гостей.
 * Для операций, требующих авторизации, использовать loginRequired
 * или loginRequiredApi.
 */
const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  const requestData = await getDataFromRequest();

  const userData = userProfileSchema.safeParse(requestData);

  if (userData.success && userData.data) {
    return userData.data;
  }

  const jwt = await cookiesUtils.getJWT();

  if (!jwt) {
    return null;
  }

  return parseJWT(jwt);
});

export const getSessionByToken = async (
  jwt: string,
): Promise<UserProfile | null> => {
  if (!jwt) {
    return null;
  }

  return parseJWT(jwt);
};

export default getCurrentUser;
