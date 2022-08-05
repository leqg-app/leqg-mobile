import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Portal } from 'react-native-paper';

import { theme } from './constants';
import Map from './containers/Map/Map';
import Favorites from './containers/Favorites/Favorites';
import Account from './containers/Account/Account';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Portal.Host>
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
          headerShown: false,
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
  </Portal.Host>
);

export default TabNavigator;
