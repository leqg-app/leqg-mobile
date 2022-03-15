import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMMKVBoolean } from 'react-native-mmkv';

import { theme } from './constants';
import Map from './containers/Map/Map';
import Favorites from './containers/Favorites/Favorites';
import Account from './containers/Account/Account';
import EditStore from './containers/EditStore/EditStore';
import Splash from './Splash';
import { storage } from './store/storage';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="MapTab"
    screenOptions={({ route }) => ({
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: '#fff',

      tabBarActiveTintColor: theme.colors.primary,
      tabBarIcon: ({ color, size }) => {
        const icons = {
          MapTab: 'map',
          FavoritesTab: 'bookmark-outline',
          AccountTab: 'account',
        };

        return (
          <MaterialCommunityIcons
            name={icons[route.name]}
            color={color}
            size={size}
          />
        );
      },
    })}>
    <Tab.Screen
      name="MapTab"
      component={Map}
      options={{
        headerShown: false,
        title: 'Carte',
      }}
    />
    <Tab.Screen
      name="FavoritesTab"
      component={Favorites}
      options={{
        title: 'Enregistrés',
        lazy: false,
      }}
    />
    <Tab.Screen
      name="AccountTab"
      component={Account}
      options={{
        headerShown: false,
        title: 'Compte',
        lazy: false,
      }}
    />
  </Tab.Navigator>
);

const Main = createNativeStackNavigator();
const Routes = () => {
  const [firstOpen] = useMMKVBoolean('firstOpen', storage);

  if (!firstOpen) {
    return <Splash />;
  }

  return (
    <NavigationContainer>
      <Main.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="TabNavigator">
        <Main.Screen name="TabNavigator" component={TabNavigator} />
        <Main.Screen name="EditStoreScreen" component={EditStore} />
      </Main.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
