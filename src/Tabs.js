import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Map from './containers/Map/Map';
import Favorites from './containers/Favorites/Favorites';
import Account from './containers/Account/Account';
import Products from './containers/Products/Products';

const Tab = createBottomTabNavigator();

const tabBar = ({ navigation, state, descriptors, insets }) => (
  <BottomNavigation.Bar
    navigationState={state}
    safeAreaInsets={insets}
    onTabPress={({ route, preventDefault }) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (event.defaultPrevented) {
        preventDefault();
      } else {
        navigation.navigate(route);
      }
    }}
    renderIcon={({ route, focused, color }) => {
      const { options } = descriptors[route.key];
      if (options.tabBarIcon) {
        return options.tabBarIcon({ focused, color, size: 24 });
      }

      return null;
    }}
    getLabelText={({ route }) => {
      const { options } = descriptors[route.key];
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.title;

      return label;
    }}
  />
);

const TabNavigator = () => {
  return (
    <Portal.Host>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={tabBar}>
        <Tab.Screen
          name="MapTab"
          component={Map}
          options={{
            tabBarLabel: 'Carte',
            tabBarIcon: ({ color, size, focused }) => {
              return (
                <Icon
                  name={focused ? 'map' : 'map-outline'}
                  size={size}
                  color={color}
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="ProductsTab"
          component={Products}
          options={{
            tabBarLabel: 'Bières',
            tabBarIcon: ({ color, size, focused }) => {
              return (
                <Icon
                  name={focused ? 'beer' : 'beer-outline'}
                  size={size}
                  color={color}
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="FavoritesTab"
          component={Favorites}
          options={{
            tabBarLabel: 'Enregistrés',
            tabBarIcon: ({ color, size, focused }) => {
              return (
                <Icon
                  name={focused ? 'bookmark' : 'bookmark-outline'}
                  size={size}
                  color={color}
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="AccountTab"
          component={Account}
          options={{
            tabBarLabel: 'Compte',
            tabBarIcon: ({ color, size, focused }) => {
              return (
                <Icon
                  name={focused ? 'account' : 'account-outline'}
                  size={size}
                  color={color}
                />
              );
            },
          }}
        />
      </Tab.Navigator>
    </Portal.Host>
  );
};

export default TabNavigator;
