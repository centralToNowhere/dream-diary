/** @jest-environment node */

import UserProfileStore from '@/lib/entities/users/profile/UserProfileStore';
import type { UserProfile } from '@/lib/entities/users/types';

const profile: UserProfile = {
  id: 4,
  name: 'Dmitry',
  email: 'old@example.com',
  roleName: { type: 'user', title: 'User' },
  avatarUrl: null,
};

it('keeps drafts separate and publishes the normalized saved profile', async () => {
  const updated = { ...profile, name: 'New name', email: 'new@example.com' };
  const save = jest.fn().mockResolvedValue(updated);
  const store = new UserProfileStore(profile, save, jest.fn());
  store.setName(' New name ');
  store.setEmail(' new@example.com ');
  expect(store.profile).toEqual(profile);
  expect(store.isDirty).toBe(true);

  await store.save();
  expect(save).toHaveBeenCalledWith(
    { name: 'New name', email: 'new@example.com' },
    expect.any(AbortSignal),
  );
  expect(store.profile).toEqual(updated);
  expect(store.name).toBe(updated.name);
  expect(store.isDirty).toBe(false);
  expect(store.saved).toBe(true);
});

it('validates drafts without sending a request', async () => {
  const save = jest.fn();
  const store = new UserProfileStore(profile, save, jest.fn());
  store.setEmail('invalid');
  await store.save();
  expect(save).not.toHaveBeenCalled();
  expect(store.error).toBe('Укажи корректный email');
  store.resetDraft();
  expect(store.email).toBe(profile.email);
  expect(store.isDirty).toBe(false);
  expect(store.error).toBeNull();
});

it('preserves drafts and saved data on a conflict and allows retrying', async () => {
  const save = jest
    .fn()
    .mockRejectedValueOnce(
      new Error('Этот email или имя пользователя уже заняты'),
    )
    .mockResolvedValueOnce({ ...profile, name: 'Available' });
  const store = new UserProfileStore(profile, save, jest.fn());
  store.setName('Taken');
  await store.save();
  expect(store.profile).toEqual(profile);
  expect(store.name).toBe('Taken');
  expect(store.error).toContain('заняты');
  expect(store.isSaving).toBe(false);
  store.setName('Available');
  await store.save();
  expect(store.profile?.name).toBe('Available');
  expect(store.error).toBeNull();
});

it('aborts pending work and ignores its result after disposal', async () => {
  let finish!: (profile: UserProfile) => void;
  const save = jest.fn(
    () =>
      new Promise<UserProfile>((resolve) => {
        finish = resolve;
      }),
  );
  const store = new UserProfileStore(profile, save, jest.fn());
  store.setName('Changed');
  const pending = store.save();
  await store.save();
  expect(save).toHaveBeenCalledTimes(1);
  const signal = (save.mock.calls[0] as unknown as [unknown, AbortSignal])[1];
  store.dispose();
  expect(signal.aborted).toBe(true);
  finish({ ...profile, name: 'Changed' });
  await pending;
  expect(store.profile).toBeNull();
  expect(store.name).toBe('');
  expect(store.saved).toBe(false);
  await store.save();
  expect(save).toHaveBeenCalledTimes(1);
});

it('can retry loading a profile after initialization failed', async () => {
  const load = jest.fn().mockResolvedValue(profile);
  const store = new UserProfileStore(null, jest.fn(), load, 'Failed');
  await store.reload();
  expect(store.profile).toEqual(profile);
  expect(store.name).toBe(profile.name);
  expect(store.error).toBeNull();
});
