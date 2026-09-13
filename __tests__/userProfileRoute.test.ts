/** @jest-environment node */

import { GET, PATCH } from '@/app/api/users/profile/route';
import { NextRequest } from 'next/server';
import getCurrentUser from '@/lib/entities/users/getUserProfile';
import { loginRequiredApi } from '@/lib/entities/users/loginRequired';
import {
  getUserProfileById,
  updateUserProfile,
} from '@/lib/entities/users/repository';
import cookiesUtils from '@/lib/shared/auth/cookies/cookiesUtils';
import { updateJWTProfile } from '@/lib/shared/auth/jwt';

jest.mock('@/lib/entities/users/getUserProfile', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/lib/entities/users/loginRequired', () => ({
  loginRequiredApi: jest.fn(),
}));
jest.mock('@/lib/entities/users/repository', () => ({
  getUserProfileById: jest.fn(),
  updateUserProfile: jest.fn(),
}));
jest.mock('@/lib/shared/auth/cookies/cookiesUtils', () => ({
  __esModule: true,
  JWT_TOKEN_KEY: 'jwt',
  REFRESH_TOKEN_KEY: 'refreshToken',
  default: { getJWT: jest.fn(), setJWT: jest.fn() },
}));
jest.mock('@/lib/shared/auth/jwt', () => ({ updateJWTProfile: jest.fn() }));

const user = {
  id: 4,
  name: 'Old name',
  email: 'old@example.com',
  roleName: { type: 'user' as const, title: 'User' },
};
const updated = { ...user, name: 'New name', email: 'new@example.com' };
const token = { jwt: 'updated-jwt', jwtExpires: new Date('2030-01-01') };
const request = (body: unknown) =>
  new Request('http://localhost/api/users/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(loginRequiredApi).mockResolvedValue(user);
  jest.mocked(cookiesUtils.getJWT).mockResolvedValue('old-jwt');
  jest.mocked(updateJWTProfile).mockReturnValue(token);
  jest.mocked(updateUserProfile).mockResolvedValue(updated);
});

it('returns null for a guest without querying the database', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue(null);
  const response = await GET(
    new NextRequest('http://localhost/api/users/profile'),
  );
  await expect(response.json()).resolves.toBeNull();
  expect(getUserProfileById).not.toHaveBeenCalled();
});

it('loads the latest profile from the database instead of stale JWT claims', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue(user);
  jest.mocked(getUserProfileById).mockResolvedValue(updated);
  const response = await GET(
    new NextRequest('http://localhost/api/users/profile'),
  );
  await expect(response.json()).resolves.toEqual(updated);
  expect(getUserProfileById).toHaveBeenCalledWith(user.id);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
});

it("updates only the authenticated user's editable fields and rewrites the JWT cookie", async () => {
  const response = await PATCH(
    request({
      id: 99,
      roleName: 'admin',
      name: ' New name ',
      email: ' new@example.com ',
    }),
  );
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(updated);
  expect(updateUserProfile).toHaveBeenCalledWith(user.id, {
    name: 'New name',
    email: 'new@example.com',
  });
  expect(updateJWTProfile).toHaveBeenCalledWith('old-jwt', updated);
  expect(cookiesUtils.setJWT).toHaveBeenCalledWith(
    { token: token.jwt, expires: token.jwtExpires },
    response.cookies,
  );
});

it('requests refresh instead of treating an expired access token as a guest', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue(null);
  const response = await GET(
    new NextRequest('http://localhost/api/users/profile', {
      headers: { cookie: 'refreshToken=refresh' },
    }),
  );
  expect(response.status).toBe(401);
  expect(getUserProfileById).not.toHaveBeenCalled();
});

it('stops unauthenticated requests before writing to the database', async () => {
  jest.mocked(loginRequiredApi).mockRejectedValue(new Error('unauthorized'));
  await expect(PATCH(request(updated))).rejects.toThrow('unauthorized');
  expect(updateUserProfile).not.toHaveBeenCalled();
});

it.each([
  { name: 'ab', email: 'new@example.com' },
  { name: 'Valid name', email: 'invalid' },
])('rejects invalid profile fields: %j', async (input) => {
  expect((await PATCH(request(input))).status).toBe(400);
  expect(updateUserProfile).not.toHaveBeenCalled();
});

it('returns a conflict without rewriting the session cookie', async () => {
  jest.mocked(updateUserProfile).mockRejectedValue({ code: '23505' });
  const response = await PATCH(request(updated));
  expect(response.status).toBe(409);
  await expect(response.json()).resolves.toEqual({
    error: 'Этот email или имя пользователя уже заняты',
  });
  expect(cookiesUtils.setJWT).not.toHaveBeenCalled();
});

it('does not update the database if the JWT can no longer be updated', async () => {
  jest.mocked(updateJWTProfile).mockReturnValue(null);
  expect((await PATCH(request(updated))).status).toBe(401);
  expect(updateUserProfile).not.toHaveBeenCalled();
});
