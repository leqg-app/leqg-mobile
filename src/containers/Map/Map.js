import React, { useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar } from 'react-native';
import { Button, Chip, Dialog, Portal, Searchbar } from 'react-native-paper';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import BottomSheet from 'reanimated-bottom-sheet';

import { useStore } from '../../store/context';
import StoreDetails from './StoreDetails';
import ProductFilter from './ProductFilter';

MapboxGL.setAccessToken(
  'pk.eyJ1IjoibmljbzJjaGUiLCJhIjoiY2lzYm5zcHAzMDAxNDJvbWtwb3dyY2ZuYiJ9.eSWQhgnzx-RQWqSx5ltXcg',
);

function PriceFilter({ onClose, onPrice, initialPrice = 10 }) {
  const [price, setPrice] = React.useState(initialPrice);

  useEffect(() => {
    setPrice(initialPrice);
  }, [initialPrice]);

  const onSubmit = () => {
    onClose();
    onPrice(price);
  };

  return (
    <Portal>
      <Dialog visible onDismiss={onClose}>
        <Dialog.Title>Filtrer par prix: {price}€</Dialog.Title>
        <Dialog.Content>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#000000"
            onValueChange={value => setPrice(value)}
            value={price}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose}>Annuler</Button>
          <Button onPress={onSubmit}>Valider</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const CENTER = [2.341924, 48.860395];

const Map = ({ navigation, route }) => {
  const [state, actions] = useStore();
  const [text, onChangeText] = React.useState('');
  const [coordinates, setCoordinates] = React.useState({});
  const [selectedBar, selectBar] = React.useState(false);
  const [priceModal, setPriceModal] = React.useState(false);
  const [priceFilter, setPriceFilter] = React.useState(undefined);
  const [beerFilter, setBeerFilter] = React.useState(13);

  useEffect(() => {
    if (beerFilter !== route.params?.productFilter) {
      setBeerFilter(route.params?.productFilter);
    }
  }, [route.params?.productFilter]);

  useEffect(() => {
    if (!state.loading && coordinates.northEast) {
      actions.getStores(coordinates);
      if (!state.products.length) {
        actions.getProducts();
      }
    }
  }, [coordinates]);

  useEffect(() => {
    if (selectedBar) {
      actions.getStore(selectedBar.id);
    }
  }, [selectedBar]);

  const storesShape = {
    type: 'FeatureCollection',
    features: state.stores.map(store => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [store.longitude, store.latitude],
      },
      properties: store,
    })),
  };

  // hooks
  const sheetRef = useRef(null);

  const regionChanged = ({ properties }) => {
    const [northEast, southWest] = properties.visibleBounds;
    setCoordinates({ northEast, southWest });
  };

  const filters = [];
  if (priceFilter) {
    filters.push(['<=', 'price', priceFilter]);
  }
  if (beerFilter) {
    filters.push(['in', beerFilter, ['get', 'products']]);
  }

  return (
    <SafeAreaView style={styles.map}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <MapboxGL.MapView
        style={styles.absolute}
        localizeLabels={true}
        rotateEnabled={false}
        pitchEnabled={false}
        onRegionDidChange={regionChanged}
        onPress={() => sheetRef.current?.snapTo(0)}>
        <MapboxGL.Camera zoomLevel={11} centerCoordinate={CENTER} />
        <MapboxGL.UserLocation />
        <MapboxGL.ShapeSource
          id="earthquakes"
          shape={storesShape}
          onPress={e => {
            sheetRef.current?.snapTo(1);
            selectBar(e.features[0].properties);
          }}>
          <MapboxGL.CircleLayer
            id="singlePoint"
            filter={filters && ['all', ...filters]}
            style={{
              circleColor: 'green',
              circleRadius: [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                5,
                13,
                10,
              ],
            }}
          />
          <MapboxGL.SymbolLayer
            id="singlePointCount"
            aboveLayerID="singlePoint"
            filter={filters && ['all', ...filters]}
            style={{
              textField: ['to-string', ['get', 'price']],
              textSize: ['interpolate', ['linear'], ['zoom'], 10, 5, 13, 9],
              textMaxWidth: 50,
              textColor: '#FFF',
              textAnchor: 'center',
              textTranslate: [0, 0],
              textAllowOverlap: true,
            }}
          />
        </MapboxGL.ShapeSource>
      </MapboxGL.MapView>
      <Searchbar
        style={styles.searchbar}
        placeholder="Rechercher"
        onChangeText={onChangeText}
        value={text}
      />
      <View style={styles.filters}>
        <Chip
          style={styles.filter}
          icon="currency-usd"
          onPress={() => setPriceModal(true)}
          onClose={priceFilter && (() => setPriceFilter(undefined))}
          mode="outlined">
          {priceFilter ? `Prix: ${priceFilter}€` : 'Prix'}
        </Chip>
        <Chip
          style={styles.filter}
          icon="beer-outline"
          onPress={() => navigation.navigate('ProductFilter')}
          onClose={beerFilter && (() => setBeerFilter(undefined))}
          mode="outlined">
          {beerFilter
            ? `Bière: ${state.products.find(p => p.id === beerFilter)?.name}`
            : 'Bière'}
        </Chip>
      </View>
      {priceModal && (
        <PriceFilter
          onClose={() => setPriceModal(false)}
          onPrice={price => setPriceFilter(price)}
          initialPrice={priceFilter}
        />
      )}
      <BottomSheet
        ref={sheetRef}
        snapPoints={['0%', '15%', '100%']}
        borderRadius={10}
        renderContent={() =>
          selectedBar ? <StoreDetails store={selectedBar} /> : false
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  map: {
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
  filters: {
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
    marginLeft: 25,
  },
  filter: {
    zIndex: 1,
    marginRight: 10,
  },
  contentContainer: {
    zIndex: 99,
    flex: 1,
    elevation: 3,
    alignItems: 'center',
  },
  calloutWrapper: {
    backgroundColor: 'white',
    height: '100%',
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
