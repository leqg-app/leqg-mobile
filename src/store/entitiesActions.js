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

  // -- Load stores

  async function loadStores() {
    const apiVersions = await getVersion;
    const localVersions = storage.getObject('versions', {});
    const localStores = storage.getObject('stores', []);
    const localVersion = storage.getString('appVersion');

    if (
      !apiVersions?.stores ||
      (localVersion === version &&
        localStores.length &&
        localVersions.stores == apiVersions.stores)
    ) {
      // We quit, stores default value is local storage
      return;
    }

    if (
      localVersion !== version ||
      !localVersions.stores ||
      !localStores.length
    ) {
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
    const versions = storage.getObject('versions', {});

    if (!apiVersions?.[name] || versions[name] >= apiVersions[name]) {
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
      ...versions,
      [name]: apiVersions[name],
    });
    return loaded;
  }

  const loadEntities = async () => {
    setStoreLoading(true);
    await loadStores();
    setStoreLoading(false);

    loadEntity('products', getProducts, setProducts);
    loadEntity('rates', getRates, setRates);
    loadEntity('features', getFeatures, setFeatures);

    (async () => {
      const userState = storage.getObject('userState');
      if (!userState?.jwt) {
        return;
      }
      const user = await getProfile(userState.jwt);
      if (user.error) {
        setUser(null);
        return;
      }
      setUser(user);
    })();
  };

  return { loadEntities };
}

export { useEntitiesAction };
