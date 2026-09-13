'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import RootStoreProvider from '@/lib/providers/store/RootStoreProvider';
import type { GlobalStores } from '@/lib/providers/store/types';
import { subscribeToSessionChange } from '@/lib/shared/auth/sessionChange';
import createGlobalStores from './createGlobalStores';
import disposeGlobalStores from './disposeGlobalStores';

type StoreSetupProps = {
  children: ReactNode;
};

export default function StoreSetup({ children }: StoreSetupProps) {
  const [globalStores, setGlobalStores] = useState(createGlobalStores);
  const currentStores = useRef<GlobalStores | null>(globalStores);

  useEffect(() => {
    const initialize = (stores: GlobalStores) => {
      for (const registration of stores) registration.initialize?.();
    };
    const replaceStores = () => {
      if (currentStores.current) disposeGlobalStores(currentStores.current);
      const stores = createGlobalStores();
      currentStores.current = stores;
      setGlobalStores(stores);
      initialize(stores);
    };

    // Повторный запуск эффекта в Strict Mode требует новых живых хранилищ.
    if (currentStores.current) initialize(currentStores.current);
    else replaceStores();

    const unsubscribe = subscribeToSessionChange(replaceStores);
    return () => {
      unsubscribe();
      if (currentStores.current) disposeGlobalStores(currentStores.current);
      currentStores.current = null;
    };
  }, []);

  return (
    <RootStoreProvider globalStores={globalStores}>
      {children}
    </RootStoreProvider>
  );
}
