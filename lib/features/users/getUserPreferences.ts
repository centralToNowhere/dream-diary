import 'server-only';

import getCurrentUser from '@/lib/entities/users/getUserProfile';
import { getUserPreferences as getServerUserPreferences } from '@/lib/entities/users/preferences/repository';
import type { UserPreferencesDTO } from '@/lib/entities/users/preferences/types';

const getUserPreferences =
  async function (): Promise<UserPreferencesDTO | null> {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const preferences = await getServerUserPreferences({
      userId: user.id,
    });

    return preferences ?? { theme: null };
  };

export default getUserPreferences;
