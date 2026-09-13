export const PUBLIC_ROUTES = ['/', '/login', '/register'];
export const SESSION_EXPIRED_URL = '/login?session-expired=true';
export const LOGIN_ROUTE = '/login';

// Пути относительно baseURL "/api" клиентского HTTP-клиента.
export const AUTH_API_ROUTES = {
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
} as const;
