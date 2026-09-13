import { NextResponse, type NextRequest } from 'next/server';
import hasSessionCookies from '@/lib/shared/auth/hasSessionCookies';
import getCurrentUser from '@/lib/entities/users/getUserProfile';
import { loginRequiredApi } from '@/lib/entities/users/loginRequired';
import {
  getUserProfileById,
  updateUserProfile,
} from '@/lib/entities/users/repository';
import { updateUserProfileSchema } from '@/lib/entities/users/types';
import cookiesUtils from '@/lib/shared/auth/cookies/cookiesUtils';
import { updateJWTProfile } from '@/lib/shared/auth/jwt';

const headers = { 'Cache-Control': 'private, no-store' };

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user && hasSessionCookies(request)) {
    return NextResponse.json(
      { error: 'Требуется обновление сессии' },
      { status: 401, headers },
    );
  }
  const profile = user ? await getUserProfileById(user.id) : null;
  return NextResponse.json(profile, { headers });
}

export async function PATCH(request: Request) {
  const user = await loginRequiredApi();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Некорректный формат запроса' },
      { status: 400 },
    );
  }

  const input = updateUserProfileSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0].message },
      { status: 400 },
    );
  }

  const jwt = await cookiesUtils.getJWT();
  const token = jwt ? updateJWTProfile(jwt, { ...user, ...input.data }) : null;
  if (!token) {
    return NextResponse.json(
      { error: 'Сессия завершена. Войдите снова.' },
      { status: 401 },
    );
  }

  try {
    const profile = await updateUserProfile(user.id, input.data);
    if (!profile) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 },
      );
    }

    const response = NextResponse.json(profile, { headers });
    await cookiesUtils.setJWT(
      { token: token.jwt, expires: token.jwtExpires },
      response.cookies,
    );
    return response;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      return NextResponse.json(
        { error: 'Этот email или имя пользователя уже заняты' },
        { status: 409 },
      );
    }
    console.error('Failed to update user profile', error);
    return NextResponse.json(
      { error: 'Не удалось сохранить профиль. Попробуйте ещё раз.' },
      { status: 500 },
    );
  }
}
