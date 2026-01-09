import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useMigrations } from 'drizzle-orm/op-sqlite/migrator';

import EditStore from './containers/EditStore/EditStore';
import { logError } from './utils/logError';
import IntroStack from './containers/Intro/Intro';
import WonReputation from './containers/Account/WonReputation';
import RatingStores from './containers/Store/RatingStore';
import StoreProductsScreen from './containers/Store/StoreProductsScreen';
import { storage } from './store/storage';
import TabNavigator from './Tabs';
import { useEntitiesAction } from './store/entitiesActions';
import initialize, { db } from './store/database';
import migrations from './store/drizzle/migrations';

const Main = createNativeStackNavigator();

initialize();

const Routes = () => {
  const { success, error } = useMigrations(db, migrations);
  const [firstOpen] = useMMKVBoolean('firstOpen', storage);
  const loadedEntities = useRef(false);
  const { loadEntities } = useEntitiesAction();

  useEffect(() => {
    if (loadedEntities.current) {
      return;
    }
    if (error) {
      logError(error, { context: 'database migration' });
      return;
    }
    if (!success) {
      return;
    }
    loadedEntities.current = true;
    loadEntities();
  }, [error, success]);

  if (error) {
    return (
      <SafeAreaView>
        <View>
          <Text>Migration error: {error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Main.Navigator screenOptions={{ headerShown: false }}>
      {!firstOpen && <Main.Screen name="IntroStack" component={IntroStack} />}
      <Main.Screen name="TabNavigator" component={TabNavigator} />
      <Main.Screen name="EditStoreScreen" component={EditStore} />
      <Main.Screen name="WonReputation" component={WonReputation} />
      <Main.Screen name="RatingStore" component={RatingStores} />
      <Main.Screen
        name="StoreProductsScreen"
        component={StoreProductsScreen}
        options={{ headerShown: true, title: 'Carte' }}
      />
    </Main.Navigator>
  );
};

export default Routes;
