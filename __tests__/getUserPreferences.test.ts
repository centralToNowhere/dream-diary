import getUserPreferences from '@/lib/features/users/getUserPreferences';
import getCurrentUser from '@/lib/entities/users/getUserProfile';
import { getUserPreferences as getStoredPreferences } from '@/lib/entities/users/preferences/repository';

jest.mock('@/lib/entities/users/getUserProfile', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/lib/entities/users/preferences/repository', () => ({
  getUserPreferences: jest.fn(),
}));

beforeEach(() => jest.resetAllMocks());

it('allows guest layouts without querying preferences or requiring login', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue(null);
  await expect(getUserPreferences()).resolves.toBeNull();
  expect(getStoredPreferences).not.toHaveBeenCalled();
});

it('loads preferences for the authenticated user', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue({
    id: 4,
    name: 'Dmitry',
    email: 'dmitry@example.com',
    roleName: { type: 'user', title: 'User' },
  });
  jest.mocked(getStoredPreferences).mockResolvedValue({ theme: 'dark' });
  await expect(getUserPreferences()).resolves.toEqual({ theme: 'dark' });
  expect(getStoredPreferences).toHaveBeenCalledWith({ userId: 4 });
});
