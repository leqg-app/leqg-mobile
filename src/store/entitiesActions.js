import { useSetRecoilState } from 'recoil';

import { version } from '../../package.json';
import { getFeatures } from '../api/features';
import { getProducts } from '../api/products';
import { getRates } from '../api/rates';
import { getStores, getStoresVersion, getVersion } from '../api/stores';
import { decompressStore } from '../utils/formatStore';
import {
  featuresState,
  productsState,
  ratesState,
  storeLoadingState,
  storesState,
} from './atoms';
import { storage } from './storage';

function useEntitiesAction() {
  const setProducts = useSetRecoilState(productsState);
  const setRates = useSetRecoilState(ratesState);
  const setFeatures = useSetRecoilState(featuresState);
  const setStores = useSetRecoilState(storesState);
  const setStoreLoading = useSetRecoilState(storeLoadingState);

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
      const loaded = await getStores(apiVersions.stores);
      const stores = loaded.map(decompressStore);
      setStores(stores);
    } else {
      // Load only updated stores
      const { updated } = await getStoresVersion(
        localVersions.stores,
        apiVersions.stores,
      );
      const updatedStores = localStores.concat(updated.map(decompressStore));
      setStores(updatedStores);
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
  };

  return { loadEntities };
}

export { useEntitiesAction };
