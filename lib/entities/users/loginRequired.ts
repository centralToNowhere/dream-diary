import 'server-only';

import { redirect, unauthorized } from 'next/navigation';
import { SESSION_EXPIRED_URL, LOGIN_ROUTE } from '@/lib/shared/routes';
import verifyUser from '@/lib/entities/users/verifyUser';

/**
 * Серверная функция: требует авторизацию и возвращает профиль пользователя.
 * Если сессия отсутствует или невалидна, прерывает выполнение через unauthorized().
 * Cookie здесь не меняются: запоздавший 401 не должен удалить уже обновлённый JWT.
 *
 * Использовать в API-обработчиках, которым нужен отказ в доступе
 * вместо перенаправления на страницу входа, например в /api/auth/profile.
 * После успешного await проверка пользователя на null не нужна.
 */
export const loginRequiredApi = async () => {
  const result = await verifyUser();

  if (result.result === 'success') {
    return result.profile;
  }

  unauthorized();
};

/**
 * Серверная функция: требует авторизацию и возвращает профиль пользователя.
 * Если сессия отсутствует, перенаправляет на страницу входа;
 * если невалидна — на страницу входа с признаком завершённой сессии.
 * Перенаправление прерывает выполнение: после await проверка на null не нужна.
 *
 * Использовать, когда операция требует пользователя, а при отказе нужно
 * перенаправить на страницу входа: при чтении и изменении снов,
 * сохранении персональных настроек.
 * Все три функции выполняются на сервере: getCurrentUser допускает гостя,
 * loginRequired перенаправляет на вход, loginRequiredApi вызывает unauthorized().
 */
const loginRequired = async () => {
  const result = await verifyUser();

  if (result.result === 'success') {
    return result.profile;
  }

  return redirect(
    result.reason === 'invalid' ? SESSION_EXPIRED_URL : LOGIN_ROUTE,
  );
};

export default loginRequired;
