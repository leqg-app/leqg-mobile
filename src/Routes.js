import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Map from './containers/Map/Map';
import Favorites from './containers/Favorites/Favorites';
import Account from './containers/Account/Account';
import EditStore from './containers/EditStore/EditStore';

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="MapTab"
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: 'green',
        },
        headerTintColor: '#fff',

        tabBarActiveTintColor: 'green',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            MapTab: 'map',
            EditStoreTab: 'plus',
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
        name="EditStoreTab"
        component={EditStore}
        options={{
          headerShown: false,
          title: 'Ajouter',
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={Favorites}
        options={{
          title: 'Enregistrés',
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={Account}
        options={{
          headerShown: false,
          title: 'Compte',
        }}
      />
    </Tab.Navigator>
  );
};

const Main = createNativeStackNavigator();
const Routes = () => {
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
