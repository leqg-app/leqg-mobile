import { atom, atomFamily, selector } from 'recoil';

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

const storeState = atomFamily({
  key: 'storeState',
  default: null,
  effects: storeId => [
    ({ setSelf, trigger }) => {
      if (trigger === 'get') {
        setSelf(getStore(storeId));
      }
    },
  ],
});

const storesState = atom({
  key: 'storesState',
  default: storage.getObject('stores', []),
  effects_UNSTABLE: [getAllStores],
});

const storesMapState = selector({
  key: 'storesMapState',
  get: ({ get }) => {
    const stores = get(storesState);
    const all = [];
    const date = new Date();
    const currentDay = date.getDay() || 7;
    const now = date.getHours() * 60 + date.getMinutes();

    for (const store of stores) {
      if (!store.price && !store.specialPrice) {
        continue;
      }
      if (!store.price) {
        all.push({ ...store, price: store.specialPrice });
        continue;
      }
      const today = store.schedules.find(s => s.dayOfWeek === currentDay);
      if (
        !store.specialPrice ||
        !today ||
        today.closed ||
        !today.openingSpecial ||
        !today.closingSpecial
      ) {
        all.push(store);
        continue;
      }

      const specialHours =
        today.openingSpecial < today.closingSpecial
          ? today.openingSpecial < now && now < today.closingSpecial
          : today.openingSpecial < now || now < today.closingSpecial;

      if (!specialHours) {
        all.push(store);
      }

      const productsById = Object.keys(store.productsById).reduce(
        (products, id) => ({
          ...products,
          [id]: {
            ...store.productsById[id],
            price: store.productsById[id].specialPrice,
          },
        }),
        {},
      );
      all.push({ ...store, price: store.specialPrice, productsById });
    }

    return {
      type: 'FeatureCollection',
      features: all.map(store => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [store.longitude, store.latitude],
        },
        properties: store,
      })),
    };
  },
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
  storesMapState,
  storeQueryRequestIDState,
  storesState,
  productsState,
  ratesState,
  featuresState,
  storeLoadingState,
  contributionsState,
};
