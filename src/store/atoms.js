import { atom, selector } from 'recoil';

import { getStore } from '../api/stores';
import { decompressStore } from '../utils/formatStore';
import { storage } from './storage';

function persistStorage(storageId) {
  return function ({ setSelf, onSet }) {
    setSelf(storage.getObject(storageId, {}));
    onSet(newValue => storage.setObject(storageId, newValue));
  };
}

const storeEditionState = atom({
  key: 'storeEditionState',
  default: {},
});

const userState = atom({
  key: 'userState',
  effects_UNSTABLE: [persistStorage('userState')],
});

const sheetStoreState = atom({
  key: 'sheetStoreState',
  default: null,
});

const storeQueryRequestIDState = atom({
  key: 'StoreQueryRequestIDState',
  default: 0,
});

const storeState = selector({
  key: 'storeState',
  get: async ({ get }) => {
    get(storeQueryRequestIDState);
    const sheetStore = get(sheetStoreState);
    if (!sheetStore) {
      return;
    }
    return getStore(sheetStore.id);
  },
});

const storesState = atom({
  key: 'storesState',
  default: selector({
    key: 'storesState/default',
    get: () => storage.getObject('stores', []).map(decompressStore),
  }),
});

const productsState = atom({
  key: 'productsState',
  default: selector({
    key: 'productsState/default',
    get: () => storage.getObject('products', []),
  }),
});

const ratesState = atom({
  key: 'ratesState',
  default: selector({
    key: 'ratesState/default',
    get: () => storage.getObject('rates', []),
  }),
});

const featuresState = atom({
  key: 'featuresState',
  default: selector({
    key: 'featuresState/default',
    get: () => storage.getObject('features', []),
  }),
});

const storeLoadingState = atom({
  key: 'storeLoadingState',
  default: false,
});

export {
  storeEditionState,
  userState,
  sheetStoreState,
  storeState,
  storeQueryRequestIDState,
  storesState,
  productsState,
  ratesState,
  featuresState,
  storeLoadingState,
};
