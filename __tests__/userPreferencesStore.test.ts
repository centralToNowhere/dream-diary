/** @jest-environment node */

import UserPreferencesStore from '@/lib/entities/users/preferences/UserPreferencesStore';

it('can initialize and reset without browser globals during SSR', () => {
  const store = new UserPreferencesStore(undefined, jest.fn());
  expect(store.theme).toBe('light');
  store.reset();
  expect(store.theme).toBe('light');
});

it('keeps the initial theme during SSR', () => {
  const store = new UserPreferencesStore({ theme: 'dark' }, jest.fn());
  expect(store.theme).toBe('dark');
});

it('cancels pending saves and prevents further saves after disposal', () => {
  jest.useFakeTimers();
  try {
    const save = jest.fn().mockResolvedValue({ success: true });
    const store = new UserPreferencesStore({ theme: 'light' }, save);
    store.setTheme('dark');
    expect(jest.getTimerCount()).toBe(1);

    store.dispose();
    store.dispose();
    expect(jest.getTimerCount()).toBe(0);
    store.setTheme('light');
    jest.runAllTimers();
    expect(save).not.toHaveBeenCalled();
  } finally {
    jest.useRealTimers();
  }
});
