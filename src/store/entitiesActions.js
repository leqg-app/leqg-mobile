import { useSetAtom } from 'jotai';

import { version } from '../../package.json';
import { logError } from '../utils/logError';
import { getFeatures } from '../api/features';
import { getProducts } from '../api/products';
import { getRates } from '../api/rates';
import { getStores, getStoresVersion, getVersion } from '../api/stores';
import { getProfile } from '../api/users';
import { storesToDatabase } from '../utils/formatStore';
import {
  featuresState,
  productsState,
  ratesState,
  storeLoadingState,
  storesState,
  userState,
} from './atoms';
import { storage } from './storage';
import * as db from './database';

function useEntitiesAction() {
  const setProducts = useSetAtom(productsState);
  const setRates = useSetAtom(ratesState);
  const setFeatures = useSetAtom(featuresState);
  const setStores = useSetAtom(storesState);
  const setStoreLoading = useSetAtom(storeLoadingState);
  const setUser = useSetAtom(userState);

  // -- Load stores

  async function loadStores() {
    const apiVersions = await getVersion;
    const dbStores = await db.getStores();
    const localVersions = storage.getObject('versions', {});
    const appVersion = storage.getString('appVersion');

    // no internet, quit
    if (!apiVersions?.stores) {
      setStores(dbStores);
      return;
    }

    const needReset =
      apiVersions.reset !== localVersions.reset ||
      (apiVersions.stores === localVersions.stores &&
        apiVersions.count.stores !== dbStores.length) ||
      appVersion !== version;

    if (!needReset && localVersions.stores === apiVersions.stores) {
      setStores(dbStores);
      return;
    }

    if (needReset || !localVersions.stores || !dbStores.length) {
      // Load all stores
      const stores = await getStores(apiVersions.stores);
      const readableStores = stores.map(storesToDatabase);
      db.setStores(readableStores);
      setStores(readableStores);
    } else {
      // Load only updated storesl
      const versioned = await getStoresVersion(
        localVersions.stores,
        apiVersions.stores,
      );

      if (versioned?.updated || versioned?.deleted) {
        const { updated = [], deleted = [] } = versioned;
        const readableStores = dbStores
          .filter(
            store =>
              updated.every(([id]) => store.id !== id) &&
              deleted.every(id => store.id !== id),
          )
          .concat(updated.map(storesToDatabase));
        setStores(readableStores);
      } else {
        logError(versioned, {
          context: 'loadStores - versioned stores update',
          localVersions,
          apiVersions,
        });
      }
    }

    storage.set('appVersion', version);
    storage.setObject('versions', {
      ...localVersions,
      stores: apiVersions.stores,
    });
  }

  // -- Load other entities

  async function loadEntity(name, getEntity, setEntity) {
    const apiVersions = await getVersion;
    const appVersion = storage.getString('appVersion');
    const localVersions = storage.getObject('versions', {});

    // no internet, quit
    if (!apiVersions?.[name]) {
      return;
    }

    const needReset =
      apiVersions.reset !== localVersions.reset || appVersion !== version;

    if (!needReset && localVersions[name] === apiVersions[name]) {
      return;
    }

    const loaded = await getEntity(apiVersions[name]).catch(() => false);
    if (!loaded) {
      return;
    }
    if (setEntity) {
      setEntity(loaded);
    }
    storage.setObject(name, loaded);
    storage.setObject('versions', {
      ...localVersions,
      [name]: apiVersions[name],
    });
    return loaded;
  }

  async function loadUser() {
    const userStored = storage.getObject('user');
    if (!userStored) {
      return;
    }
    try {
      const user = await getProfile(userStored.jwt);
      if (user.error) {
        throw '';
      }
      setUser(user);
    } catch {
      setUser(null);
    }
  }

  const loadEntities = async () => {
    setStoreLoading(true);
    await loadStores();
    setStoreLoading(false);

    loadUser();

    await Promise.all([
      loadEntity('products', getProducts, setProducts),
      loadEntity('rates', getRates, setRates),
      loadEntity('features', getFeatures, setFeatures),
    ]);

    const apiVersions = await getVersion;
    const localVersions = storage.getObject('versions', {});

    if (apiVersions.reset !== localVersions.reset) {
      storage.setObject('versions', {
        ...localVersions,
        reset: apiVersions.reset,
      });
    }
  };

  return { loadEntities };
}

export { useEntitiesAction };
