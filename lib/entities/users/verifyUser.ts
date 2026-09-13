import type { UserProfile } from '@/lib/entities/users/types';
import getCurrentUser from '@/lib/entities/users/getUserProfile';
import cookiesUtils from '@/lib/shared/auth/cookies/cookiesUtils';

type VerifyUserResult =
  | {
      result: 'success';
      profile: UserProfile;
    }
  | {
      result: 'failure';
      reason: 'missing' | 'invalid';
    };

const verifyUser = async (): Promise<VerifyUserResult> => {
  const [accessToken, refreshToken] = await Promise.all([
    cookiesUtils.getJWT(),
    cookiesUtils.getRefreshToken(),
  ]);

  if (!accessToken && !refreshToken) {
    return {
      result: 'failure',
      reason: 'missing',
    };
  }

  if (accessToken) {
    const user = await getCurrentUser();

    if (user) {
      return {
        result: 'success',
        profile: user,
      };
    }
  }

  return {
    result: 'failure',
    reason: 'invalid',
  };
};

export default verifyUser;
