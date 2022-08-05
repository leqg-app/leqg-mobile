import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMMKVBoolean } from 'react-native-mmkv';

import { theme } from './constants';
import EditStore from './containers/EditStore/EditStore';
import IntroStack from './containers/Intro/Intro';
import WonReputation from './containers/Account/WonReputation';
import { storage } from './store/storage';
import TabNavigator from './Tabs';
import { useEntitiesAction } from './store/entitiesActions';

const Main = createNativeStackNavigator();

const Routes = () => {
  const [firstOpen] = useMMKVBoolean('firstOpen', storage);
  const loadedEntities = useRef(false);
  const { loadEntities } = useEntitiesAction();

  useEffect(() => {
    if (loadedEntities.current) {
      return;
    }
    loadedEntities.current = true;
    loadEntities();
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
