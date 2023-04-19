import React, { useEffect } from 'react';
import {
  BackHandler,
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilState, useRecoilValue } from 'recoil';

import Filters from './Filters/Filters';
import Mapbox from './Mapbox';
import StoreSheet from './StoreSheet';
import SearchBar from '../../components/SearchBar';
import SearchStore from './SearchStore';
import { sheetStoreState, storeLoadingState } from '../../store/atoms';

const Map = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const storeLoading = useRecoilValue(storeLoadingState);
  const [sheetStore, setSheetStore] = useRecoilState(sheetStoreState);
  const { params } = route;

  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  useFocusEffect(() => {
    const event = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (sheetStore) {
          setSheetStore();
          return true;
        }
        return false;
      },
    );
    return () => event.remove();
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle(`${isDarkMode ? 'light' : 'dark'}-content`);
  }, [isDarkMode]);

  return (
    <SafeAreaView style={styles.container}>
      <Mapbox />
      <SearchBar
        onSearch={() => navigation.navigate('SearchStore')}
        onBack={sheetStore && (() => setSheetStore())}
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
      headerShown: false,
    }}>
    <MapStack.Screen name="MapScreen" component={Map} />
    <MapStack.Group
      screenOptions={{ presentation: 'fullScreenModal', animation: 'fade' }}>
      <MapStack.Screen name="SearchStore" component={SearchStore} />
    </MapStack.Group>
  </MapStack.Navigator>
);
