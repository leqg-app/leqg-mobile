import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Dimensions, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomSheet from 'reanimated-bottom-sheet';

import { useStore } from '../../store/context';
import StoreDetails from './StoreDetails';
import ProductFilter from './ProductFilter';
import Filters from './Filters';
import Mapbox from './Mapbox';

const Map = () => {
  const [, actions] = useStore();
  const [text, onChangeText] = useState('');
  const [selectedStore, selectStore] = useState(false);
  const [filters, setFilters] = useState([]);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (selectedStore) {
      actions.getStore(selectedStore.id);
    }
  }, [selectedStore]);

  const sheetSize = useMemo(
    () => (135 / Dimensions.get('window').height) * 100,
    [],
  );

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
          console.log({ store });
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
      <BottomSheet
        ref={sheetRef}
        snapPoints={['0%', `${sheetSize}%`, '100%']}
        borderRadius={10}
        renderContent={() =>
          selectedStore ? <StoreDetails store={selectedStore} /> : false
        }
      />
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
    <MapStack.Screen name="StoreDetails" component={StoreDetails} />
    <MapStack.Screen name="ProductFilter" component={ProductFilter} />
  </MapStack.Navigator>
);
