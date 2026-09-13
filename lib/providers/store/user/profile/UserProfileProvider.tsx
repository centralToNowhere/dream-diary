'use client';

import type { ReactNode } from 'react';
import type UserProfileStore from '@/lib/entities/users/profile/UserProfileStore';
import UserProfileContext from '@/lib/entities/users/profile/UserProfileContext';

export default function UserProfileProvider({
  storeInstance,
  children,
}: {
  storeInstance: UserProfileStore;
  children: ReactNode;
}) {
  return (
    <UserProfileContext.Provider value={storeInstance}>
      {children}
    </UserProfileContext.Provider>
  );
}
