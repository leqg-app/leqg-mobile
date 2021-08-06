import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import { useStore } from './store/context';
import Map from './Map';
import Auth from './Auth';
import AddStore from './AddStore';

const Drawer = createDrawerNavigator();

const Routes = () => {
  const [state] = useStore();
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Map"
        screenOptions={{ headerShown: false }}>
        <Drawer.Screen
          name="Map"
          component={Map}
          options={{ title: 'Carte des bars' }}
        />
        {!state.jwt && (
          <Drawer.Screen
            name="Auth"
            component={Auth}
            options={{ title: 'Connexion' }}
          />
        )}
        <Drawer.Screen
          name="Add"
          component={AddStore}
          options={{ title: 'Ajouter un bar' }}
        />
        {state.jwt && (
          <>
            <Drawer.Screen
              name="Contributions"
              component={AddStore}
              options={{ title: 'Mes contributions' }}
            />
            <Drawer.Screen
              name="Account"
              component={AddStore}
              options={{ title: 'Mon compte' }}
            />
          </>
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
