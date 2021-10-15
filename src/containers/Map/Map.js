import React, { useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProductFilter from './ProductFilter';
import Filters from './Filters';
import Mapbox from './Mapbox';
import StoreScreen from './StoreScreen';

const Map = () => {
  const [text, onChangeText] = useState('');
  const [selectedStore, selectStore] = useState(false);
  const [filters, setFilters] = useState([]);
  const sheetRef = useRef(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <Mapbox
        filters={filters}
        onPress={store => {
          selectStore(store);
          sheetRef.current.snapTo(store ? 1 : 0);
        }}
      />
      <Searchbar
        style={styles.searchbar}
        placeholder="Rechercher"
        onChangeText={onChangeText}
        value={text}
      />
      <Filters onChange={filters => setFilters(filters)} />
      <StoreScreen store={selectedStore} sheetRef={sheetRef} />
    </SafeAreaView>
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
  },
});

const MapStack = createNativeStackNavigator();

export default () => (
  <MapStack.Navigator
    screenOptions={{ headerShown: false, safeAreaInsets: { top: 0 } }}>
    <MapStack.Screen name="MapScreen" component={Map} />
    <MapStack.Screen name="ProductFilter" component={ProductFilter} />
  </MapStack.Navigator>
);
