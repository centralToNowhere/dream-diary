/** @jest-environment node */

import { NextRequest } from 'next/server';
import { getSessionByToken } from '@/lib/entities/users/getUserProfile';
import { refreshByToken } from '@/lib/features/auth/refresh';
import cookiesUtils from '@/lib/shared/auth/cookies/cookiesUtils';
import { parseJWT } from '@/lib/shared/auth/jwt';
import { proxy } from '@/proxy';

jest.mock('@/lib/entities/users/getUserProfile', () => ({
  getSessionByToken: jest.fn(),
}));

jest.mock('@/lib/features/auth/refresh', () => ({
  refreshByToken: jest.fn(),
}));

jest.mock('@/lib/shared/auth/cookies/cookiesUtils', () => ({
  __esModule: true,
  JWT_TOKEN_KEY: 'jwt',
  REFRESH_TOKEN_KEY: 'refreshToken',
  default: {
    getJWT: jest.fn((cookies) => cookies.get('jwt')?.value),
    getRefreshToken: jest.fn((cookies) => cookies.get('refreshToken')?.value),
    setJWT: jest.fn(),
    removeJWT: jest.fn(),
    removeRefreshToken: jest.fn(),
  },
}));

jest.mock('@/lib/shared/auth/jwt', () => ({
  parseJWT: jest.fn(),
}));

const getSessionByTokenMock = jest.mocked(getSessionByToken);
const refreshByTokenMock = jest.mocked(refreshByToken);
const cookiesUtilsMock = jest.mocked(cookiesUtils);
const parseJWTMock = jest.mocked(parseJWT);

const user = {
  id: 4,
  name: 'Dmitry',
  email: 'dmitry@example.com',
  avatarUrl: null,
  roleName: { type: 'user' as const, title: 'User' },
};

describe('proxy request routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not check API POST requests', async () => {
    const request = new NextRequest('http://localhost/api/dreams', {
      method: 'POST',
      headers: {
        cookie: 'jwt=access-token',
        'next-action': 'spoofed-action-id',
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(getSessionByTokenMock).not.toHaveBeenCalled();
    expect(refreshByTokenMock).not.toHaveBeenCalled();
  });

  it('checks private Server Actions', async () => {
    const request = new NextRequest('http://localhost/dream/new', {
      method: 'POST',
      headers: {
        cookie: 'jwt=access-token',
        'next-action': 'action-id',
      },
    });
    getSessionByTokenMock.mockResolvedValue(user);

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(getSessionByTokenMock).toHaveBeenCalledWith('access-token');
    expect(refreshByTokenMock).not.toHaveBeenCalled();
  });

  it('refreshes a private Server Action before continuing its POST', async () => {
    const formData = new FormData();
    formData.set('title', 'My dream');
    const request = new NextRequest('http://localhost/dream/new', {
      method: 'POST',
      headers: {
        cookie: 'jwt=expired; refreshToken=refresh-token',
        'next-action': 'action-id',
      },
      body: formData,
    });
    const jwtExpires = new Date('2026-08-27T12:00:00Z');
    getSessionByTokenMock.mockResolvedValueOnce(null);
    refreshByTokenMock.mockResolvedValue({
      userId: user.id,
      jwt: 'new-jwt',
      jwtExpires,
    });
    parseJWTMock.mockReturnValue(user);

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(refreshByTokenMock).toHaveBeenCalledWith('refresh-token');
    expect(cookiesUtilsMock.setJWT).toHaveBeenCalledWith(
      {
        token: 'new-jwt',
        expires: jwtExpires,
      },
      response.cookies,
    );
    expect((await request.formData()).get('title')).toBe('My dream');
  });

  it('allows a public Server Action without a session', async () => {
    const request = new NextRequest('http://localhost/register', {
      method: 'POST',
      headers: { 'next-action': 'register-action-id' },
    });

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(getSessionByTokenMock).not.toHaveBeenCalled();
    expect(refreshByTokenMock).not.toHaveBeenCalled();
  });
});
