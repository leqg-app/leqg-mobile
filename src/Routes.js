import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useStore } from './store/context';
import Map from './Map';
import Auth from './Auth';
import AddStore from './AddStore';

const Tab = createBottomTabNavigator();

const Routes = () => {
  const [state] = useStore();
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Map"
        screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="Map"
          component={Map}
          options={{
            title: 'Carte',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="map" color={color} size={size} />
            ),
          }}
        />
        {!state.jwt && (
          <Tab.Screen
            name="Auth"
            component={Auth}
            options={{
              title: 'Contribuer',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="plus" color={color} size={size} />
              ),
            }}
          />
        )}
        <Tab.Screen
          name="Add"
          component={AddStore}
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
          name="Account"
          component={AddStore}
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
