import { atom, selector, selectorFamily } from 'recoil';

import {
  getVersion,
  getStore,
  getStores,
  getStoresVersion,
} from '../api/stores';
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
  setSelf(storage.getObject('userState', null));
  onSet(newValue => storage.setObject('userState', newValue));
}

async function getAllStores({ setSelf }) {
  const stores = storage.getObject('stores', []);
  if (stores.length) {
    setSelf(stores.map(decompressStore));
  }
  const apiVersions = await getVersion;
  const versions = storage.getObject('versions', {});
  if (!apiVersions?.stores || versions.stores >= apiVersions.stores) {
    return;
  }
  if (!versions.stores) {
    const loaded = await getStores(apiVersions.stores);
    setSelf(loaded.map(decompressStore));
    storage.setObject('stores', loaded);
  } else {
    const { updated } = await getStoresVersion(
      versions.stores,
      apiVersions.stores,
    );
    [].push.apply(stores, updated);
    setSelf(stores.map(decompressStore));
    storage.setObject('stores', stores);
  }
  storage.setObject('versions', {
    ...versions,
    stores: apiVersions.stores,
  });
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

const storeState = selectorFamily({
  key: 'storeState',
  get:
    storeId =>
    async ({ get }) => {
      get(storeQueryRequestIDState);
      return getStore(storeId);
    },
});

const storesState = atom({
  key: 'storesState',
  default: [],
  effects_UNSTABLE: [getAllStores],
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
