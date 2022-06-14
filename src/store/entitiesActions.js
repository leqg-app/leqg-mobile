import { useSetRecoilState } from 'recoil';

import { version } from '../../package.json';
import { getFeatures } from '../api/features';
import { getProducts } from '../api/products';
import { getRates } from '../api/rates';
import { getStores, getStoresVersion, getVersion } from '../api/stores';
import { getProfile } from '../api/users';
import { decompressStore } from '../utils/formatStore';
import {
  featuresState,
  productsState,
  ratesState,
  storeLoadingState,
  storesState,
  userState,
} from './atoms';
import { storage } from './storage';

function useEntitiesAction() {
  const setProducts = useSetRecoilState(productsState);
  const setRates = useSetRecoilState(ratesState);
  const setFeatures = useSetRecoilState(featuresState);
  const setStores = useSetRecoilState(storesState);
  const setStoreLoading = useSetRecoilState(storeLoadingState);
  const setUser = useSetRecoilState(userState);

  const localVersions = storage.getObject('versions', {});

  // -- Load stores

  async function loadStores() {
    const apiVersions = await getVersion;
    const localStores = storage.getObject('stores', []);
    const appVersion = storage.getString('appVersion');

    // no internet, quit
    if (!apiVersions?.stores) {
      return;
    }

    const needReset =
      apiVersions.reset !== localVersions.reset ||
      apiVersions.count.stores !== localStores.length ||
      appVersion !== version;

    if (!needReset && localVersions.stores === apiVersions.stores) {
      // stores default value is local storage and doesn't need update
      return;
    }

    if (needReset || !localVersions.stores || !localStores.length) {
      // Load all stores
      const stores = await getStores(apiVersions.stores);
      setStores(stores.map(decompressStore));
    } else {
      // Load only updated stores
      const { updated } = await getStoresVersion(
        localVersions.stores,
        apiVersions.stores,
      );
      setStores(
        localStores
          .filter(store => updated.every(([id]) => store.id !== id))
          .concat(updated.map(decompressStore)),
      );
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
    const userState = storage.getObject('userState');
    if (!userState) {
      return;
    }
    try {
      const user = await getProfile(userState.jwt);
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
