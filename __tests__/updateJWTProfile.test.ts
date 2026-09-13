/** @jest-environment node */

import { createJWT, parseJWT, updateJWTProfile } from '@/lib/shared/auth/jwt';

jest.mock('@/utilities/getEnv', () => ({
  __esModule: true,
  default: (name: string) =>
    name === 'JWT_SECRET' ? 'profile-test-secret' : '15',
}));

const user = {
  id: 4,
  name: 'Old name',
  email: 'old@example.com',
  roleName: { type: 'user' as const, title: 'User' },
};

it('updates name and email while preserving session, expiry, and role', () => {
  const original = createJWT(user, 12);
  const updated = updateJWTProfile(original.jwt, {
    ...user,
    name: 'New name',
    email: 'new@example.com',
  });
  expect(updated).not.toBeNull();
  expect(parseJWT(updated!.jwt)).toEqual({
    ...user,
    name: 'New name',
    email: 'new@example.com',
  });
  const oldPayload = JSON.parse(
    Buffer.from(original.jwt.split('.')[1], 'base64url').toString(),
  );
  const newPayload = JSON.parse(
    Buffer.from(updated!.jwt.split('.')[1], 'base64url').toString(),
  );
  expect(newPayload).toMatchObject({
    sId: oldPayload.sId,
    exp: oldPayload.exp,
    jti: oldPayload.jti,
    roleName: oldPayload.roleName,
  });
  expect(updated!.jwtExpires.getTime()).toBe(oldPayload.exp * 1000);
});

it("rejects another user's profile and tampered tokens", () => {
  const { jwt } = createJWT(user, 12);
  expect(updateJWTProfile(jwt, { ...user, id: 99 })).toBeNull();
  expect(updateJWTProfile(`${jwt}tampered`, user)).toBeNull();
});

it('does not revive an expired session', () => {
  jest.useFakeTimers();
  try {
    const { jwt } = createJWT(user, 12);
    jest.advanceTimersByTime(16 * 60 * 1000);
    expect(updateJWTProfile(jwt, user)).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});
