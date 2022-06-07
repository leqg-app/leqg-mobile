import { atom, selector, selectorFamily } from 'recoil';

import { getStore } from '../api/stores';
import { getContributions, getProfile } from '../api/users';
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

async function getAllStores({ onSet }) {
  // Everytime we update state, we store it
  onSet(stores => {
    storage.setObject('stores', stores);
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
