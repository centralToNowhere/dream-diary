import UserProfileStore from '@/lib/entities/users/profile/UserProfileStore';
import {
  getUserProfileRequest,
  updateUserProfileRequest,
} from '@/lib/features/users/profileRequests';
import type { StoreRegistration } from '../../types';
import UserProfileProvider from './UserProfileProvider';

export default function createUserProfileStore(): StoreRegistration<UserProfileStore> {
  const store = new UserProfileStore(
    null,
    updateUserProfileRequest,
    getUserProfileRequest,
  );
  return {
    store,
    initialize: () => {
      void store.reload();
    },
    provide: (children) => (
      <UserProfileProvider storeInstance={store}>
        {children}
      </UserProfileProvider>
    ),
  };
}
