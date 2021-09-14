import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Pressable } from 'react-native';
import {
  ActivityIndicator,
  Card,
  Paragraph,
  Searchbar,
} from 'react-native-paper';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/core';

import { useStore } from './store/context';
import StoreDetails from './StoreDetails';

MapboxGL.setAccessToken('');

const layerStyles = {
  singlePoint: {
    circleColor: 'green',
    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
    circleRadius: 5,
    circlePitchAlignment: 'map',
  },

  clusteredPoints: {
    circlePitchAlignment: 'map',

    circleColor: [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1',
    ],

    circleRadius: ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },

  clusterCount: {
    textField: '{point_count}',
    textSize: 12,
    textPitchAlignment: 'map',
  },
};

function CalloutBar({ selectedBar, store = {} }) {
  const navigation = useNavigation();
  const { name } = selectedBar;
  const { address } = store;
  return (
    <View style={styles.calloutWrapper}>
      <Pressable onPress={() => navigation.navigate('StoreDetails', { store })}>
        <Card>
          <Card.Title title={name} />
          <Card.Content>
            {address ? (
              <Paragraph>{address}</Paragraph>
            ) : (
              <ActivityIndicator animating={true} />
            )}
          </Card.Content>
        </Card>
      </Pressable>
    </View>
  );
}

const CENTER = [2.341924, 48.860395];

const Map = ({ navigation }) => {
  const [state, actions] = useStore();
  const [text, onChangeText] = React.useState('');
  const [coordinates, setCoordinates] = React.useState({});
  const [selectedBar, selectBar] = React.useState(false);

  useEffect(() => {
    if (!state.loading && coordinates.northEast) {
      actions.getStores(coordinates);
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

  const regionChanged = ({ properties }) => {
    const [northEast, southWest] = properties.visibleBounds;
    setCoordinates({ northEast, southWest });
  };

  return (
    <SafeAreaView style={styles.absolute}>
      <MapboxGL.MapView
        style={styles.absolute}
        localizeLabels={true}
        rotateEnabled={false}
        pitchEnabled={false}
        onRegionDidChange={regionChanged}
        onPress={() => selectBar(false)}>
        <MapboxGL.Camera
          zoomLevel={11}
          centerCoordinate={CENTER}
          followUserMode={'normal'}
          followUserLocation
        />
        <MapboxGL.UserLocation />
        <MapboxGL.ShapeSource
          cluster
          clusterRadius={10}
          id="earthquakes"
          shape={storesShape}
          onPress={e => selectBar(e.features[0].properties)}>
          <MapboxGL.CircleLayer
            id="singlePoint"
            style={{
              circleColor: 'green',
              circleStrokeWidth: 2,
              circleStrokeColor: 'white',
              circleRadius: 10,
            }}
          />
          <MapboxGL.SymbolLayer
            id="singlePointCount"
            aboveLayerID="singlePoint"
            style={{
              textField: ['to-string', ['get', 'price']],
              textSize: 9,
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
        icon="menu"
        onIconPress={() => navigation.toggleDrawer()}
        placeholder="Rechercher"
        onChangeText={onChangeText}
        value={text}
      />
      {selectedBar && (
        <CalloutBar
          selectedBar={selectedBar}
          store={state.storesDetails[selectedBar.id]}
        />
      )}
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
    elevation: 3,
    color: 'white',
    margin: 20,
    borderRadius: 30,
    height: 45,
    paddingLeft: 10,
  },
  circleMarker: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#00f',
  },
  calloutWrapper: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});

const MapStack = createNativeStackNavigator();

export default () => (
  <MapStack.Navigator screenOptions={{ headerShown: false }}>
    <MapStack.Screen name="MapSsz" component={Map} />
    <MapStack.Screen name="StoreDetails" component={StoreDetails} />
  </MapStack.Navigator>
);
