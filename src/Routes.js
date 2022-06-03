import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useSetRecoilState } from 'recoil';

import { theme } from './constants';
import EditStore from './containers/EditStore/EditStore';
import IntroStack from './containers/Intro/Intro';
import WonReputation from './containers/Account/WonReputation';
import { storage } from './store/storage';
import TabNavigator from './Tabs';
import { getVersion } from './api/stores';
import { getFeatures } from './api/features';
import { getProducts } from './api/products';
import { getRates } from './api/rates';
import { getStores } from './api/stores';
import {
  storesState,
  productsState,
  ratesState,
  featuresState,
  storeLoadingState,
} from './store/atoms';
import { decompressStore } from './utils/formatStore';

const versionRequest = getVersion().catch(() => ({}));

const Main = createNativeStackNavigator();

const Routes = () => {
  const [firstOpen] = useMMKVBoolean('firstOpen', storage);

  const loadedEntities = useRef(false);

  const setStores = useSetRecoilState(storesState);
  const setProducts = useSetRecoilState(productsState);
  const setRates = useSetRecoilState(ratesState);
  const setFeatures = useSetRecoilState(featuresState);
  const setStoreLoading = useSetRecoilState(storeLoadingState);

  useEffect(() => {
    if (loadedEntities.current) {
      return;
    }
    loadedEntities.current = true;

    setStoreLoading(true);

    (async () => {
      // Check if we need to get stores from API
      const apiVersions = await versionRequest;
      const versions = storage.getObject('versions', {});

      async function loadEntity(name, getEntity, setEntity) {
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

      const stores = await loadEntity('stores', getStores);
      if (stores) {
        setStores(stores.map(decompressStore));
      }
      loadEntity('products', getProducts, setProducts);
      loadEntity('rates', getRates, setRates);
      loadEntity('features', getFeatures, setFeatures);

      setStoreLoading(false);
    })();
  }, []);

  return (
    <NavigationContainer>
      <Main.Navigator
        screenOptions={{ headerShown: false }}
        defaultScreenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}>
        {!firstOpen && <Main.Screen name="IntroStack" component={IntroStack} />}
        <Main.Screen name="TabNavigator" component={TabNavigator} />
        <Main.Screen name="EditStoreScreen" component={EditStore} />
        <Main.Screen name="WonReputation" component={WonReputation} />
      </Main.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
