import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from 'react-native-geolocation-service';
import circle from '@turf/circle';
import { FAB } from 'react-native-paper';

import { useStore } from '../../store/context';

MapboxGL.setAccessToken(
  'pk.eyJ1IjoibmljbzJjaGUiLCJhIjoiY2lzYm5zcHAzMDAxNDJvbWtwb3dyY2ZuYiJ9.eSWQhgnzx-RQWqSx5ltXcg',
);

const CENTER = [2.341924, 48.860395];

const Mapbox = ({ filters, onPress }) => {
  const camera = useRef();
  const [state, actions] = useStore();
  const [geoloc, setGeoloc] = useState(false);
  const [position, setPosition] = useState(undefined);
  const [coordinates, setCoordinates] = useState({});

  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setGeoloc(true);
        setPosition([coords.longitude, coords.latitude]);
      },
      () => {
        setPosition(CENTER);
      },
    );
  }, []);

  useEffect(() => {
    if (!state.loading) {
      if (coordinates.northEast) {
        actions.getStores(coordinates);
      } else {
        // France
        actions.getStores({ northEast: [9, 52], southWest: [-6, 42] });
      }
      if (!state.products.length) {
        actions.getProducts();
      }
    }
  }, [coordinates]); // eslint-disable-line react-hooks/exhaustive-deps

  const storesShape = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: state.stores.map(store => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [store.lng, store.lat],
        },
        properties: store,
      })),
    }),
    [state.stores],
  );

  if (!position) {
    return <View />;
  }

  const regionChanged = ({ properties }) => {
    const [northEast, southWest] = properties.visibleBounds;
    setCoordinates({ northEast, southWest });
  };

  return (
    <>
      <MapboxGL.MapView
        style={styles.absolute}
        localizeLabels={true}
        rotateEnabled={false}
        pitchEnabled={false}
        onRegionDidChange={regionChanged}
        onPress={() => onPress()}>
        <MapboxGL.Camera
          ref={camera}
          zoomLevel={13}
          centerCoordinate={position}
        />
        <MapboxGL.UserLocation minDisplacement={100} />
        <MapboxGL.ShapeSource
          id="stores"
          shape={storesShape}
          onPress={e => onPress(e.features[0].properties)}>
          <MapboxGL.CircleLayer
            id="pointCircle"
            filter={filters && ['all', ...filters]}
            style={layerStyles.pointCircle}
          />
          <MapboxGL.SymbolLayer
            id="priceText"
            aboveLayerID="pointCircle"
            minZoomLevel={10.5}
            filter={filters && ['all', ...filters]}
            style={layerStyles.priceText}
          />
        </MapboxGL.ShapeSource>
        <MapboxGL.ShapeSource
          id="textSource"
          shape={{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [position[0], position[1] + 0.0095],
              properties: {},
            },
          }}>
          <MapboxGL.SymbolLayer
            id="nearText"
            minZoomLevel={12.5}
            maxZoomLevel={13.5}
            style={layerStyles.nearText}
          />
        </MapboxGL.ShapeSource>
        <MapboxGL.ShapeSource id="lineSource" shape={circle(position, 1)}>
          <MapboxGL.LineLayer
            id="nearLine"
            minZoomLevel={10.5}
            style={layerStyles.nearLine}
            belowLayerID="pointCircle"
          />
        </MapboxGL.ShapeSource>
      </MapboxGL.MapView>
      {geoloc && (
        <FAB
          style={styles.fab}
          icon="target"
          color="green"
          onPress={() => camera.current.flyTo(position)}
        />
      )}
    </>
  );
};

const date = new Date();
const day = ['at', new Date().getDay() - 1, ['get', 's']];
const time = date.getHours() * 3600 + date.getMinutes() * 60;
const textField = [
  'case',
  [
    'all',
    ['has', 'specialPrice'],
    ['has', 'os', day],
    ['>', time, ['get', 'os', day]],
    ['<', time, ['get', 'cs', day]],
  ],
  ['to-string', ['get', 'specialPrice']],
  ['to-string', ['get', 'price']],
];

const layerStyles = {
  pointCircle: {
    circleColor: 'green',
    circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 10],
  },
  priceText: {
    textField,
    textSize: ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 9],
    textMaxWidth: 50,
    textColor: '#FFF',
    textAnchor: 'center',
    textTranslate: [0, 0],
    textAllowOverlap: true,
  },
  nearLine: {
    lineColor: 'green',
    lineWidth: 1.4,
    lineOpacity: 0.84,
    lineDasharray: [5, 5],
  },
  nearText: {
    textField: '15min',
    textSize: 13,
    textColor: 'green',
    textHaloColor: 'green',
    textHaloWidth: 0.3,
  },
};

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    elevation: 0,
  },
});

export default Mapbox;
