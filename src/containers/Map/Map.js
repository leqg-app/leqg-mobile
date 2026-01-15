import React, { useEffect } from 'react';
import { Platform, StatusBar, useColorScheme, View } from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RNBootSplash from 'react-native-bootsplash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAtomValue } from 'jotai';

import Filters from './Filters/Filters';
import Mapbox from './Mapbox';
import StoreSheet from './StoreSheet';
import SearchBar from '../../components/SearchBar';
import SearchStore from './SearchStore';
import { storeLoadingState } from '../../store/atoms';

const Map = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const storeLoading = useAtomValue(storeLoadingState);
  const { params } = route;

  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle(`${isDarkMode ? 'light' : 'dark'}-content`);
  }, [isDarkMode]);

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }} testID="map-screen">
      <Mapbox />
      <SearchBar
        onSearch={() => navigation.navigate('SearchStore')}
        loading={storeLoading}
      />
      <Filters />
      <StoreSheet />
      <Portal>
        <Snackbar
          visible={params?.contribute}
          duration={2000}
          onDismiss={() => navigation.setParams({ contribute: false })}>
          Merci pour votre contribution !
        </Snackbar>
      </Portal>
    </View>
  );
};

const MapStack = createNativeStackNavigator();

export default () => (
  <MapStack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <MapStack.Screen name="MapScreen" component={Map} />
    <MapStack.Group
      screenOptions={{ presentation: 'fullScreenModal', animation: 'fade' }}>
      <MapStack.Screen name="SearchStore" component={SearchStore} />
    </MapStack.Group>
  </MapStack.Navigator>
);
