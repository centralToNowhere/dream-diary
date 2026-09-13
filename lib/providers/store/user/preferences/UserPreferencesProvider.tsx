'use client';

import { type ReactNode } from 'react';
import {
  type UserPreferencesStore,
  PreferencesContext,
} from '@/lib/entities/users/preferences';

type UserPreferencesProviderProps = {
  children: ReactNode;
  storeInstance: UserPreferencesStore;
};

const UserPreferencesProvider = ({
  children,
  storeInstance,
}: UserPreferencesProviderProps) => {
  return (
    <PreferencesContext.Provider value={storeInstance}>
      {children}
    </PreferencesContext.Provider>
  );
};

UserPreferencesProvider.displayName = 'UserPreferencesProvider';

export default UserPreferencesProvider;
