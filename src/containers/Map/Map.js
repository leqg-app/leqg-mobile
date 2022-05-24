import React, { useRef, useState, useEffect } from 'react';
import { BackHandler, Platform, StatusBar, StyleSheet } from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStore } from '../../store/context';
import { theme } from '../../constants';
import ProductFilter from './ProductFilter';
import Filters from './Filters';
import Mapbox from './Mapbox';
import StoreSheet from './StoreSheet';
import SearchBar from '../../components/SearchBar';
import SearchStore from './SearchStore';

const Map = ({ navigation, route }) => {
  const [state, actions] = useStore();
  const isFocused = useIsFocused();
  const [filters, setFilters] = useState([]);
  const { params } = route;

  useEffect(() => {
    actions.getUser();
    actions.getStores();
    actions.getProducts();
    actions.getFeatures();
    actions.getRates();
    RNBootSplash.hide({ fade: true });
  }, []);

  useFocusEffect(() => {
    const event = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (state.sheetStore) {
          actions.setSheetStore();
          return true;
        }
        return false;
      },
    );
    return () => event.remove();
  });

  useEffect(() => {
    if (isFocused) {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
      StatusBar.setBarStyle('dark-content');
    } else {
      StatusBar.setBarStyle('light-content');
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <Mapbox filters={filters} />
      <SearchBar
        onSearch={() => navigation.navigate('SearchStore')}
        onBack={state.sheetStore && (() => actions.setSheetStore())}
        loading={state.loading}
      />
      <Filters onChange={filters => setFilters(filters)} />
      <StoreSheet />
      <Portal>
        <Snackbar
          visible={params?.contribute}
          duration={2000}
          onDismiss={() => navigation.setParams({ contribute: false })}>
          Merci pour votre contribution !
        </Snackbar>
        <Snackbar
          visible={state.error}
          duration={2000}
          action={{
            label: 'OK',
          }}
          onDismiss={() => actions.dismissError()}>
          {state.error}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const MapStack = createNativeStackNavigator();

export default () => (
  <MapStack.Navigator
    screenOptions={{
      presentation: 'modal',
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: '#fff',
    }}>
    <MapStack.Group screenOptions={{ presentation: 'modal' }}>
      <MapStack.Screen
        name="MapScreen"
        component={Map}
        options={{ headerShown: false }}
      />
      <MapStack.Screen
        options={{ title: 'Filtrer par bière' }}
        name="ProductFilter"
        component={ProductFilter}
      />
    </MapStack.Group>
    <MapStack.Group
      screenOptions={{ presentation: 'fullScreenModal', animation: 'fade' }}>
      <MapStack.Screen
        options={{ headerShown: false }}
        name="SearchStore"
        component={SearchStore}
      />
    </MapStack.Group>
  </MapStack.Navigator>
);
