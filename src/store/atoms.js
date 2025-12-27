import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';

import { getStore } from '../api/stores';
import { getContributions } from '../api/users';
import { inHours } from '../utils/time';
import { storage } from './storage';
import { getLowest } from '../utils/formatStore';

const storeEditionState = atom({});

const userPrimitiveState = atom(storage.getObject('user', null));
const userState = atom(
  get => get(userPrimitiveState),
  (get, set, newValue) => {
    set(userPrimitiveState, newValue);
    if (newValue === null) {
      storage.remove('user');
    } else {
      storage.setObject('user', newValue);
    }
  },
);

const sheetStoreState = atom(null);
const storeQueryRequestIDState = atom(0);

// Backing primitive per id so we can both fetch-on-read and imperatively set
const storePrimitiveFamily = atomFamily(() => atom(null));

const storeState = atomFamily(id =>
  atom(
    async get => {
      const current = get(storePrimitiveFamily(id));
      if (current) {
        return current;
      }
      return await getStore(id);
    },
    (get, set, next) => {
      set(storePrimitiveFamily(id), next);
    },
  ),
);

const stores = atom([]);
const storesState = atom(
  get => {
    const allStores = get(stores);
    const all = [];
    const date = new Date();
    const currentDay = date.getDay() || 7;
    const now = date.getHours() * 60 + date.getMinutes();

    // If we are in special hours, replace price by special price
    // Same for all products
    for (const store of allStores) {
      const products = Object.values(store.productsById);
      const price = getLowest(products.map(p => p.price));
      const specialPrice = getLowest(products.map(p => p.specialPrice));

      if (!price && !specialPrice) {
        continue;
      }

      const today = store.schedules?.find(s => s.dayOfWeek === currentDay);
      const open = today?.closed
        ? false
        : !today ||
          !today.opening ||
          !today.closing ||
          inHours(today.opening, today.closing);

      if (!price) {
        all.push({ ...store, open, price: specialPrice });
        continue;
      }
      if (
        !specialPrice ||
        !today ||
        today.closed ||
        !today.openingSpecial ||
        !today.closingSpecial
      ) {
        all.push({ ...store, price, open });
        continue;
      }

      const specialHours =
        today.openingSpecial < today.closingSpecial
          ? today.openingSpecial < now && now < today.closingSpecial
          : today.openingSpecial < now || now < today.closingSpecial;

      if (!specialHours) {
        all.push({ ...store, price, open });
        continue;
      }

      const productsById = Object.keys(store.productsById || {}).reduce(
        (products, id) => ({
          ...products,
          [id]: {
            ...store.productsById[id],
            price: store.productsById[id].specialPrice,
          },
        }),
        {},
      );
      all.push({ ...store, open, price: specialPrice, productsById });
    }
    return all;
  },
  (_, set, update) => set(stores, update),
);

const storesMapState = atom(get => {
  const all = get(storesState);
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
});

const productsState = atom(storage.getObject('products', []));
const ratesState = atom(storage.getObject('rates', []));
const featuresState = atom(storage.getObject('features', []));
const storeLoadingState = atom(false);

const contributionsState = atom(async get => {
  get(storeQueryRequestIDState);
  const user = get(userState);
  if (!user) {
    return [];
  }
  return await getContributions(user.jwt);
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
