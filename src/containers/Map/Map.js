import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, StatusBar, View, PermissionsAndroid } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/core';
import RNBootSplash from 'react-native-bootsplash';

import { theme } from '../../constants';
import ProductFilter from './ProductFilter';
import Filters from './Filters';
import Mapbox from './Mapbox';
import StoreSheet from './StoreSheet';
import { useStore } from '../../store/context';

const Map = () => {
  const [, actions] = useStore();
  const isFocused = useIsFocused();
  const sheet = useRef(null);
  const [text, onChangeText] = useState('');
  const [selectedStore, selectStore] = useState(false);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        actions.getStores(),
        actions.getProducts(),
        actions.getUser(),
      ]);

      // TODO: better handle
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      );
    };

    init().finally(async () => {
      await RNBootSplash.hide({ fade: true });
    });
  }, []);

  return (
    <View style={styles.container}>
      {isFocused && (
        <StatusBar
          barStyle="dark-content"
          translucent={true}
          backgroundColor="transparent"
        />
      )}
      <Mapbox
        filters={filters}
        selectedStore={selectedStore}
        onPress={store => {
          selectStore(store);
          sheet.current.snapTo(store ? 1 : 0);
        }}
      />
      <Searchbar
        style={styles.searchbar}
        placeholder="Rechercher"
        onChangeText={onChangeText}
        value={text}
        clearButtonMode="always"
      />
      <Filters onChange={filters => setFilters(filters)} />
      <StoreSheet sheet={sheet} store={selectedStore} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    zIndex: 1,
    elevation: 0,
    color: 'white',
    marginTop: 40,
    marginHorizontal: 20,
    borderRadius: 30,
    height: 45,
    paddingLeft: 10,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
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
  </MapStack.Navigator>
);
