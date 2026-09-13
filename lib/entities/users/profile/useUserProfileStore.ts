'use client';

import { useContext } from 'react';
import UserProfileContext from './UserProfileContext';

export default function useUserProfileStore() {
  const store = useContext(UserProfileContext);
  if (!store)
    throw new Error(
      'User profile is not available outside of UserProfileProvider',
    );
  return store;
}
