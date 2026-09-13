import getCurrentUser from '@/lib/entities/users/getUserProfile';
import { getDataFromRequest } from '@/lib/shared/auth/userDataHeader';
import cookiesUtils from '@/lib/shared/auth/cookies/cookiesUtils';
import { parseJWT } from '@/lib/shared/auth/jwt';

jest.mock('@/lib/shared/auth/userDataHeader', () => ({
  getDataFromRequest: jest.fn(),
}));
jest.mock('@/lib/shared/auth/cookies/cookiesUtils', () => ({
  __esModule: true,
  default: { getJWT: jest.fn() },
}));
jest.mock('@/lib/shared/auth/jwt', () => ({ parseJWT: jest.fn() }));

const user = {
  id: 4,
  name: 'Дмитрий',
  email: 'dmitry@example.com',
  roleName: { type: 'user' as const, title: 'Пользователь' },
};

beforeEach(() => jest.resetAllMocks());

it('validates the user profile at the entity boundary', async () => {
  jest.mocked(getDataFromRequest).mockResolvedValue({ id: 4 });
  jest.mocked(cookiesUtils.getJWT).mockResolvedValue(undefined);
  await expect(getCurrentUser()).resolves.toBeNull();
});

it('returns a valid profile from the request header', async () => {
  jest.mocked(getDataFromRequest).mockResolvedValue(user);
  await expect(getCurrentUser()).resolves.toEqual(user);
  expect(cookiesUtils.getJWT).not.toHaveBeenCalled();
});

it('falls back to the access token when the header profile is invalid', async () => {
  jest.mocked(getDataFromRequest).mockResolvedValue({ id: 4 });
  jest.mocked(cookiesUtils.getJWT).mockResolvedValue('access-token');
  jest.mocked(parseJWT).mockReturnValue(user);
  await expect(getCurrentUser()).resolves.toEqual(user);
  expect(parseJWT).toHaveBeenCalledWith('access-token');
});
