/** @jest-environment node */

import getUserPreferencesRequest from '@/lib/features/users/getUserPreferencesRequest';
import apiClient from '@/lib/shared/http/apiClient';

afterEach(() => jest.restoreAllMocks());

it.each([null, { theme: 'light' }, { theme: null }])(
  'loads preferences independently of the router: %j',
  async (preferences) => {
    const request = jest
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: preferences });

    await expect(getUserPreferencesRequest()).resolves.toEqual(preferences);
    expect(request).toHaveBeenCalledWith('/users/preferences');
  },
);

it('rejects failed responses so the store factory can use its fallback', async () => {
  jest.spyOn(apiClient, 'get').mockRejectedValue(new Error('Server error'));

  await expect(getUserPreferencesRequest()).rejects.toThrow('Server error');
});

it('does not reuse guest data after login', async () => {
  const request = jest
    .spyOn(apiClient, 'get')
    .mockResolvedValueOnce({ data: null })
    .mockResolvedValueOnce({ data: { theme: 'dark' } });

  await expect(getUserPreferencesRequest()).resolves.toBeNull();
  await expect(getUserPreferencesRequest()).resolves.toEqual({ theme: 'dark' });
  expect(request).toHaveBeenCalledTimes(2);
});
