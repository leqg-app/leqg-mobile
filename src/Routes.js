import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useMigrations } from 'drizzle-orm/op-sqlite/migrator';
import * as Sentry from '@sentry/react-native';

import EditStore from './containers/EditStore/EditStore';
import IntroStack from './containers/Intro/Intro';
import WonReputation from './containers/Account/WonReputation';
import RatingStores from './containers/Store/RatingStore';
import { storage } from './store/storage';
import TabNavigator from './Tabs';
import { useEntitiesAction } from './store/entitiesActions';
import initialize from './store/database';
import migrations from './store/drizzle/migrations';

const Main = createNativeStackNavigator();

initialize();

const Routes = () => {
  const { success, error } = useMigrations(migrations);
  const [firstOpen] = useMMKVBoolean('firstOpen', storage);
  const loadedEntities = useRef(false);
  const { loadEntities } = useEntitiesAction();

  useEffect(() => {
    if (loadedEntities.current) {
      return;
    }
    if (error) {
      Sentry.captureException(error);
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
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  return (
    <Main.Navigator screenOptions={{ headerShown: false }}>
      {!firstOpen && <Main.Screen name="IntroStack" component={IntroStack} />}
      <Main.Screen name="TabNavigator" component={TabNavigator} />
      <Main.Screen name="EditStoreScreen" component={EditStore} />
      <Main.Screen name="WonReputation" component={WonReputation} />
      <Main.Screen name="RatingStore" component={RatingStores} />
    </Main.Navigator>
  );
};

export default Routes;
