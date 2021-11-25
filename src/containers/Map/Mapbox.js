import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PermissionsAndroid, StyleSheet, View } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from 'react-native-geolocation-service';
import circle from '@turf/circle';
import { FAB, useTheme } from 'react-native-paper';

import { theme } from '../../constants';
import { useStore } from '../../store/context';

MapboxGL.setAccessToken(
  'pk.eyJ1IjoibmljbzJjaGUiLCJhIjoiY2lzYm5zcHAzMDAxNDJvbWtwb3dyY2ZuYiJ9.eSWQhgnzx-RQWqSx5ltXcg',
);

const CENTER = [2.341924, 48.860395];

const Mapbox = ({ filters, onPress, selectedStore }) => {
  const camera = useRef();
  const [state] = useStore();
  const { colors } = useTheme();
  const [geoloc, setGeoloc] = useState(false);
  const [position, setPosition] = useState(undefined);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setGeoloc(true);
        setPosition([coords.longitude, coords.latitude]);
      },
      () => {
        setPosition(CENTER);
      },
      {
        timeout: 2000,
      },
    );
  }, [PermissionsAndroid.RESULTS]);

  useEffect(() => {
    if (selectedStore && camera.current) {
      camera.current.setCamera({
        centerCoordinate: [selectedStore.lng, selectedStore.lat],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  }, [selectedStore]);

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

  const pointCircle = {
    circleColor: selectedStore
      ? [
          'case',
          ['==', selectedStore.id, ['get', 'id']],
          theme.colors.accent,
          theme.colors.bright,
        ]
      : theme.colors.bright,
    circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 10],
  };

  return (
    <>
      <MapboxGL.MapView
        style={styles.absolute}
        localizeLabels={true}
        rotateEnabled={false}
        pitchEnabled={false}
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
            style={pointCircle}
          />
          <MapboxGL.SymbolLayer
            id="priceText"
            aboveLayerID="pointCircle"
            minZoomLevel={12}
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
          color={colors.primary}
          onPress={() => camera.current.flyTo(position)}
        />
      )}
    </>
  );
};

const date = new Date();
const today = date.getDay() ? date.getDay() - 1 : 6;
const day = ['object', ['at', today, ['get', 's']]];
const time = date.getHours() * 3600 + date.getMinutes() * 60;
const textField = [
  'case',
  [
    'all',
    ['has', 'specialPrice'], // if has special price AND
    [
      'any',
      [
        'all',
        ['has', 'os', day],
        // TODO: case of reverted special schedule
        ['>', time, ['get', 'os', day]], // AND time > special open
        ['<', time, ['get', 'cs', day]], // AND time < special close
      ],
      // OR don't has regular price
      ['!', ['to-boolean', ['get', 'price']]],
    ],
  ],
  // then display special price
  ['to-string', ['get', 'specialPrice']],
  // else display price
  ['to-string', ['get', 'price']],
];

const layerStyles = {
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
    lineColor: theme.colors.primary,
    lineWidth: 1.4,
    lineOpacity: 0.84,
    lineDasharray: [5, 5],
  },
  nearText: {
    textField: '15min',
    textSize: 13,
    textColor: theme.colors.primary,
    textHaloColor: theme.colors.primary,
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
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default Mapbox;
