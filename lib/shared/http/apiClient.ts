'use client';

import axios, { CanceledError, type InternalAxiosRequestConfig } from 'axios';
import { AUTH_API_ROUTES, SESSION_EXPIRED_URL } from '@/lib/shared/routes';

type AuthRequestConfig = InternalAxiosRequestConfig & {
  authRetried?: boolean;
  tokenVersion?: number;
};

const authEndpoints = new Set<string>(Object.values(AUTH_API_ROUTES));

export function createApiClient(onSessionExpired: () => void) {
  const client = axios.create({ baseURL: '/api', withCredentials: true });
  let refreshPromise: Promise<void> | null = null;
  let tokenVersion = 0;
  let redirected = false;

  const expireSession = () => {
    if (redirected) return;
    redirected = true;
    onSessionExpired();
  };

  client.interceptors.request.use((config: AuthRequestConfig) => {
    config.tokenVersion = tokenVersion;
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      if (response.config.url === AUTH_API_ROUTES.login) redirected = false;
      return response;
    },
    async (error: unknown) => {
      if (
        !axios.isAxiosError(error) ||
        error.response?.status !== 401 ||
        !error.config
      )
        throw error;
      const config = error.config as AuthRequestConfig;
      if (authEndpoints.has(config.url ?? '')) throw error;
      if (config.signal?.aborted) throw new CanceledError();
      if (config.authRetried) {
        expireSession();
        throw error;
      }

      config.authRetried = true;
      // A delayed 401 may belong to a token that another request already refreshed.
      if (config.tokenVersion === tokenVersion) {
        if (!refreshPromise) {
          // Refresh has no caller's AbortSignal: cancelling one request must not cancel it for everyone.
          refreshPromise = client
            .post(AUTH_API_ROUTES.refresh)
            .then(() => {
              tokenVersion += 1;
            })
            .catch((refreshError: unknown) => {
              if (
                axios.isAxiosError(refreshError) &&
                refreshError.response?.status === 401
              )
                expireSession();
              throw refreshError;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
      }

      if (config.signal?.aborted) throw new CanceledError();
      return client.request(config);
    },
  );

  return client;
}

const apiClient = createApiClient(() => {
  window.location.assign(SESSION_EXPIRED_URL);
});

export default apiClient;
