/** @jest-environment node */

import { refreshSession } from '@/lib/entities/sessions/repository';
import { refreshByToken } from '@/lib/features/auth/refresh';
import type { SessionRefreshResponse } from '@/lib/entities/sessions/types';

jest.mock('@/lib/entities/sessions/repository', () => ({
  refreshSession: jest.fn(),
}));

const refreshSessionMock = jest.mocked(refreshSession);

const refreshedSession: SessionRefreshResponse = {
  userId: 4,
  jwt: 'new-jwt',
  jwtExpires: new Date('2026-08-27T12:00:00Z'),
};

describe('refreshByToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null without querying the database for an empty token', async () => {
    await expect(refreshByToken('')).resolves.toBeNull();
    expect(refreshSessionMock).not.toHaveBeenCalled();
  });

  it('refreshes the session for every request', async () => {
    refreshSessionMock.mockResolvedValue(refreshedSession);

    await expect(refreshByToken('refresh-token')).resolves.toEqual(
      refreshedSession,
    );
    await expect(refreshByToken('refresh-token')).resolves.toEqual(
      refreshedSession,
    );

    expect(refreshSessionMock).toHaveBeenNthCalledWith(1, 'refresh-token');
    expect(refreshSessionMock).toHaveBeenNthCalledWith(2, 'refresh-token');
    expect(refreshSessionMock).toHaveBeenCalledTimes(2);
  });
});
