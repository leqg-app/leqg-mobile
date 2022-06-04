import { atom, selector } from 'recoil';

import { getStore } from '../api/stores';
import { getContributions, getProfile } from '../api/users';
import { decompressStore } from '../utils/formatStore';
import { storage } from './storage';

function persistUser({ setSelf, onSet }) {
  const jwt = storage.getString('jwt');
  if (jwt) {
    setSelf(null);
    getProfile(jwt).then(user => {
      setSelf(user);
      storage.set('jwt', '');
      storage.setObject('userState', user);
    });
  }
  setSelf(storage.getObject('userState', {}));
  onSet(newValue => storage.setObject('userState', newValue));
}

const storeEditionState = atom({
  key: 'storeEditionState',
  default: {},
});

const userState = atom({
  key: 'userState',
  effects_UNSTABLE: [persistUser],
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
  default: storage.getObject('stores', []).map(decompressStore),
});

const productsState = atom({
  key: 'productsState',
  default: storage.getObject('products', []),
});

const ratesState = atom({
  key: 'ratesState',
  default: storage.getObject('rates', []),
});

const featuresState = atom({
  key: 'featuresState',
  default: storage.getObject('features', []),
});

const storeLoadingState = atom({
  key: 'storeLoadingState',
  default: false,
});

const contributionsState = selector({
  key: 'contributionsState',
  get: async ({ get }) => {
    get(storeQueryRequestIDState);
    const user = get(userState);
    if (!user) {
      return;
    }
    return getContributions(user.jwt);
  },
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
  contributionsState,
};
