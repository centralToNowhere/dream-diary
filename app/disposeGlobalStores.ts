import type { GlobalStores } from '@/lib/providers/store/types';

export default function disposeGlobalStores(stores: GlobalStores) {
  for (const { store } of stores) {
    store.dispose();
  }
}
