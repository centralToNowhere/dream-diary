import { notifySessionChange } from '@/lib/shared/auth/sessionChange';
import apiClient from '@/lib/shared/http/apiClient';
import { AUTH_API_ROUTES } from '@/lib/shared/routes';

export class LogoutRequestError extends Error {}

const logoutRequest = async (): Promise<void> => {
  try {
    await apiClient.post(AUTH_API_ROUTES.logout);
  } catch {
    throw new LogoutRequestError('Не удалось выйти из аккаунта');
  }

  notifySessionChange();
};

export default logoutRequest;
