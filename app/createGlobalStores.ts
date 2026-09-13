import createUserPreferencesStore from '@/lib/providers/store/user/preferences/createUserPreferencesStore';
import createUserProfileStore from '@/lib/providers/store/user/profile/createUserProfileStore';
import type { GlobalStores } from '@/lib/providers/store/types';

// Создание хранилищ не зависит от сетевых запросов.
export default function createGlobalStores(): GlobalStores {
  return [createUserPreferencesStore(), createUserProfileStore()];
}
