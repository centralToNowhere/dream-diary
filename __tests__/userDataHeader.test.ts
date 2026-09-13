import {
  deserializeData,
  serializeData,
} from '@/lib/shared/auth/userDataHeader';

const user = {
  id: 4,
  name: 'Дмитрий',
  email: 'dmitry@example.com',
  avatarUrl: null,
  roleName: { type: 'user' as const, title: 'Пользователь' },
};

describe('userDataHeader', () => {
  it('round-trips a user profile with unicode fields', () => {
    expect(deserializeData(serializeData(user))).toEqual(user);
  });

  it('rejects malformed header data', () => {
    expect(deserializeData('not-a-user-profile')).toBeNull();
  });

  it('decodes arbitrary objects without applying the user profile schema', () => {
    const value = Buffer.from(JSON.stringify({ id: 4 }), 'utf8').toString(
      'base64url',
    );

    expect(deserializeData(value)).toEqual({ id: 4 });
  });

  it.each([null, [], 'text', 42, true])(
    'rejects non-object data: %j',
    (data) => {
      const value = Buffer.from(JSON.stringify(data), 'utf8').toString(
        'base64url',
      );
      expect(deserializeData(value)).toBeNull();
    },
  );
});
