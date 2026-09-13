'use client';

import { type ReactNode } from 'react';
import { enableStaticRendering } from 'mobx-react-lite';
import type { GlobalStores } from './types';

enableStaticRendering(typeof window === 'undefined');

type StoreProviderProps = {
  children: ReactNode;
  globalStores: GlobalStores;
};

/**
 * Инкапсулирует провайдеры глобальных сторов
 */
export default function RootStoreProvider({
  children,
  globalStores,
}: StoreProviderProps) {
  return globalStores.reduceRight<ReactNode>(
    (content, { provide }) => provide(content),
    children,
  );
}
