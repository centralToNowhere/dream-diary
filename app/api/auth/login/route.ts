import login from '@/lib/features/auth/login';
import cookiesUtils from '@/lib/shared/auth/cookies/cookiesUtils';
import { LoginInputSchema } from '@/lib/entities/users/types';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Некорректный формат запроса' },
      { status: 400 },
    );
  }

  const validationResult = LoginInputSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        error:
          validationResult.error.issues[0]?.message ??
          'Проверьте введённые данные',
      },
      { status: 400 },
    );
  }

  const user = await login(validationResult.data);

  if (!user) {
    return NextResponse.json(
      { error: 'Неверный email или пароль' },
      { status: 401 },
    );
  }

  await cookiesUtils.setJWT({
    token: user.jwt,
    expires: user.jwtExpires,
  });

  await cookiesUtils.setRefreshToken({
    token: user.refreshToken,
    expires: user.refreshTokenExpires,
  });

  return NextResponse.json({ success: true });
};
