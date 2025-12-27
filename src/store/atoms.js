import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';

import { getStore } from '../api/stores';
import { getContributions } from '../api/users';
import { inHours } from '../utils/time';
import { storage } from './storage';
import { getLowest } from '../utils/formatStore';
import { scheduleFilterState } from './filterAtoms';

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

function storeCoversFilterTime(start1, end1, start2, end2) {
  // Normaliser les horaires du filtre (convertir en 0-1439)
  const filterStartNorm = start2 >= 1440 ? start2 - 1440 : start2;
  const filterEndNorm = end2 >= 1440 ? end2 - 1440 : end2;

  // Cas 1: Le filtre est entièrement après minuit (start2 >= 1440 && end2 >= 1440)
  if (start2 >= 1440 && end2 >= 1440) {
    // On cherche des stores ouverts toute la plage après minuit
    if (start1 > end1) {
      // Store chevauche minuit (ex: 22h-3h = 1320-180)
      // Vérifier si [0, end1] contient [filterStartNorm, filterEndNorm]
      return 0 <= filterStartNorm && filterEndNorm <= end1;
    } else {
      // Store ne chevauche pas minuit (ex: 0h-3h = 0-180)
      // Vérifier si [start1, end1] contient [filterStartNorm, filterEndNorm]
      return start1 <= filterStartNorm && filterEndNorm <= end1;
    }
  }

  // Cas 2: Le filtre est entièrement avant minuit (end2 < 1440)
  if (end2 < 1440) {
    if (start1 <= end1) {
      // Store ne chevauche pas minuit - vérification simple
      // Le store doit ouvrir avant ou au début du filtre et fermer après ou à la fin
      return start1 <= start2 && end2 <= end1;
    }
    // Store chevauche minuit (ex: 22h-2h = 1320-120)
    // Vérifier si la partie avant minuit [start1, 1439] contient [start2, end2]
    return start1 <= start2 && end2 <= 1439;
  }

  // Cas 3: Le filtre chevauche minuit (start2 < 1440 && end2 >= 1440)
  // Ex: 22h-2h = 1320-1560 (1560 - 1440 = 120 = 2h)
  if (start1 <= end1) {
    // Store ne chevauche pas minuit
    // Le store ne peut pas couvrir une plage qui chevauche minuit
    return false;
  } else {
    // Store chevauche aussi minuit (ex: 20h-3h = 1200-180)
    // Vérifier que le store ouvre avant le début du filtre ET ferme après la fin
    // Partie avant minuit: start1 <= start2
    // Partie après minuit: filterEndNorm <= end1
    return start1 <= start2 && filterEndNorm <= end1;
  }
}

// Vérifie si un store match les critères du filtre de schedule
function storeMatchesScheduleFilter(store, scheduleFilter) {
  if (!scheduleFilter || !store.schedules || store.schedules.length === 0) {
    return true;
  }

  const { days, startTime, endTime } = scheduleFilter;

  // Pour chaque jour sélectionné, vérifier si le store est ouvert pendant les horaires
  for (const dayOfWeek of days) {
    const schedule = store.schedules.find(s => s.dayOfWeek === dayOfWeek);

    if (!schedule || schedule.closed) {
      continue;
    }

    // Vérifier les horaires normaux
    if (schedule.opening && schedule.closing) {
      if (
        storeCoversFilterTime(
          schedule.opening,
          schedule.closing,
          startTime,
          endTime,
        )
      ) {
        return true;
      }
    }

    // Vérifier les horaires spéciaux (happy hour)
    if (schedule.openingSpecial && schedule.closingSpecial) {
      if (
        storeCoversFilterTime(
          schedule.openingSpecial,
          schedule.closingSpecial,
          startTime,
          endTime,
        )
      ) {
        return true;
      }
    }
  }

  // Si le filtre commence après minuit (>= 1440), vérifier aussi le jour précédent
  // Car un store du jour précédent peut être ouvert après minuit
  if (startTime >= 1440) {
    for (const dayOfWeek of days) {
      // Calculer le jour précédent (1-7, avec wrap-around)
      const previousDay = dayOfWeek === 1 ? 7 : dayOfWeek - 1;
      const prevSchedule = store.schedules.find(
        s => s.dayOfWeek === previousDay,
      );

      if (!prevSchedule || prevSchedule.closed) {
        continue;
      }

      // Vérifier si le store du jour précédent chevauche minuit
      if (
        prevSchedule.opening &&
        prevSchedule.closing &&
        prevSchedule.opening > prevSchedule.closing
      ) {
        if (
          storeCoversFilterTime(
            prevSchedule.opening,
            prevSchedule.closing,
            startTime,
            endTime,
          )
        ) {
          return true;
        }
      }

      // Vérifier les horaires spéciaux du jour précédent
      if (
        prevSchedule.openingSpecial &&
        prevSchedule.closingSpecial &&
        prevSchedule.openingSpecial > prevSchedule.closingSpecial
      ) {
        if (
          storeCoversFilterTime(
            prevSchedule.openingSpecial,
            prevSchedule.closingSpecial,
            startTime,
            endTime,
          )
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

const storesMapState = atom(get => {
  const all = get(storesState);
  const scheduleFilter = get(scheduleFilterState);

  return {
    type: 'FeatureCollection',
    features: all.map(store => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [store.longitude, store.latitude],
      },
      properties: {
        ...store,
        matchesScheduleFilter: storeMatchesScheduleFilter(
          store,
          scheduleFilter,
        ),
      },
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
