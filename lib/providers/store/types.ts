import type { ReactNode } from 'react';

export type DisposableStore = {
  dispose: () => void;
};

export type StoreRegistration<
  TStore extends DisposableStore = DisposableStore,
> = {
  store: TStore;
  initialize?: () => void;
  provide: (children: ReactNode) => ReactNode;
};

export type GlobalStores = readonly StoreRegistration[];
