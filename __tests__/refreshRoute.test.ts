/** @jest-environment node */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/refresh/route';
import { refreshByToken } from '@/lib/features/auth/refresh';

jest.mock('@/lib/features/auth/refresh', () => ({ refreshByToken: jest.fn() }));

beforeEach(() => jest.resetAllMocks());

it.each([undefined, 'expired'])(
  'returns JSON 401 and clears cookies for an expired session: %s',
  async (token) => {
    jest.mocked(refreshByToken).mockResolvedValue(null);
    const request = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: token ? { cookie: `refreshToken=${token}` } : {},
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(response.headers.get('location')).toBeNull();
    await expect(response.json()).resolves.toEqual({
      error: 'Сессия завершена. Войдите снова.',
    });
    expect(response.cookies.get('jwt')?.value).toBe('');
    expect(response.cookies.get('refreshToken')?.value).toBe('');
  },
);

it('sets the refreshed access token and returns success', async () => {
  jest
    .mocked(refreshByToken)
    .mockResolvedValue({
      userId: 4,
      jwt: 'new-jwt',
      jwtExpires: new Date('2030-01-01'),
    });
  const response = await POST(
    new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: { cookie: 'refreshToken=valid' },
    }),
  );
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ success: true });
  expect(response.cookies.get('jwt')).toMatchObject({
    value: 'new-jwt',
    httpOnly: true,
  });
  expect(response.cookies.get('refreshToken')).toBeUndefined();
});
