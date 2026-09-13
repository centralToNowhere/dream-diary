import { UserPreferencesStore } from '@/lib/entities/users/preferences';
import getUserPreferencesRequest from '@/lib/features/users/getUserPreferencesRequest';
import updatePreferencesAction from '@/lib/features/users/actions/updatePreferencesAction';
import type { StoreRegistration } from '../../types';
import UserPreferencesProvider from './UserPreferencesProvider';

export default function createUserPreferencesStore(): StoreRegistration<UserPreferencesStore> {
  const store = new UserPreferencesStore(undefined, updatePreferencesAction);
  let active = true;
  const dispose = store.dispose;
  store.dispose = () => {
    active = false;
    dispose();
  };

  return {
    store,
    initialize: () => {
      store.applySystemTheme();
      void getUserPreferencesRequest().then(
        (preferences) => {
          if (active) store.applyPreferences(preferences);
        },
        (error: unknown) => {
          if (active) console.error('Не удалось загрузить настройки', error);
        },
      );
    },
    provide: (children) => (
      <UserPreferencesProvider storeInstance={store}>
        {children}
      </UserPreferencesProvider>
    ),
  };
}
