import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Map from './containers/Map/Map';
import Favorites from './Favorites';
import Account from './containers/Account/Account';
import EditStore from './containers/EditStore/EditStore';

const Tab = createBottomTabNavigator();

const Routes = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="MapTab"
        screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="MapTab"
          component={Map}
          options={{
            title: 'Carte',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="map" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="EditStoreTab"
          component={EditStore}
          options={{
            title: 'Contribuer',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="plus" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="FavoritesTab"
          component={Favorites}
          options={{
            title: 'Enregistrés',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="bookmark-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name="AccountTab"
          component={Account}
          options={{
            title: 'Compte',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account"
                color={color}
                size={size}
              />
            ),
          }}
        />
        {/* 
        {state.jwt && (
          <>
            <Tab.Screen
              name="Contributions"
              component={AddStore}
              options={{ title: 'Mes contributions' }}
            />
            <Tab.Screen
              name="Account"
              component={AddStore}
              options={{ title: 'Mon compte' }}
            />
          </>
        )} */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
