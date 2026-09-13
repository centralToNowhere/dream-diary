import { LoginUserInput } from '@/lib/entities/users/types';
import { notifySessionChange } from '@/lib/shared/auth/sessionChange';
import axios from 'axios';
import apiClient from '@/lib/shared/http/apiClient';
import { AUTH_API_ROUTES } from '@/lib/shared/routes';

type LoginResponse = {
  success: true;
};

type LoginErrorResponse = {
  error?: string;
};

export class LoginRequestError extends Error {}

const loginRequest = async (
  credentials: LoginUserInput,
): Promise<LoginResponse> => {
  try {
    const { data } = await apiClient.post<LoginResponse>(
      AUTH_API_ROUTES.login,
      credentials,
    );
    notifySessionChange();
    return data;
  } catch (error: unknown) {
    const message = axios.isAxiosError<LoginErrorResponse>(error)
      ? error.response?.data?.error
      : undefined;
    throw new LoginRequestError(message ?? 'Не удалось войти');
  }
};

export default loginRequest;
