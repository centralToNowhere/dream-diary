/** @jest-environment node */

import { GET } from '@/app/api/users/preferences/route';
import { NextRequest } from 'next/server';
import getCurrentUser from '@/lib/entities/users/getUserProfile';
import { getUserPreferences } from '@/lib/entities/users/preferences/repository';

jest.mock('@/lib/entities/users/getUserProfile', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/lib/entities/users/preferences/repository', () => ({
  getUserPreferences: jest.fn(),
}));

beforeEach(() => jest.resetAllMocks());

it('returns uncached guest preferences without querying the database', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue(null);

  const response = await GET(
    new NextRequest('http://localhost/api/users/preferences'),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  await expect(response.json()).resolves.toBeNull();
  expect(getUserPreferences).not.toHaveBeenCalled();
});

it.each([{ theme: 'dark' as const }, null])(
  "returns the current user's preferences: %j",
  async (preferences) => {
    jest.mocked(getCurrentUser).mockResolvedValue({
      id: 4,
      name: 'Dmitry',
      email: 'dmitry@example.com',
      roleName: { type: 'user', title: 'User' },
    });
    jest.mocked(getUserPreferences).mockResolvedValue(preferences);

    const response = await GET(
      new NextRequest('http://localhost/api/users/preferences'),
    );
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(response.json()).resolves.toEqual(
      preferences ?? { theme: null },
    );
    expect(getUserPreferences).toHaveBeenCalledWith({ userId: 4 });
  },
);

it('returns 401 when session cookies exist but the access token is no longer valid', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue(null);
  const request = new NextRequest('http://localhost/api/users/preferences', {
    headers: { cookie: 'refreshToken=refresh' },
  });
  expect((await GET(request)).status).toBe(401);
  expect(getUserPreferences).not.toHaveBeenCalled();
});
