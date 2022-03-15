import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapboxGL, { Logger } from '@react-native-mapbox-gl/maps';
import Geolocation from 'react-native-geolocation-service';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import circle from '@turf/circle';
import { FAB, useTheme } from 'react-native-paper';
import Config from 'react-native-config';

import tooltipIcon from '../../assets/tooltip-50.png';
import { isDark, theme } from '../../constants';
import { useStore } from '../../store/context';
import searchPlace from '../../utils/searchPlace';
import CreateStoreSheet from './CreateStoreSheet';

MapboxGL.setAccessToken(Config.MAPBOX_API_KEY);

// https://github.com/react-native-mapbox-gl/maps/issues/943
if (__DEV__) {
  Logger.setLogCallback(log => {
    const { message } = log;
    if (message.match('Request failed due to a permanent error: Canceled')) {
      return true;
    }
    return false;
  });
}

const CENTER = [2.341924, 48.860395];

const Mapbox = ({ filters, onPress, selectedStore }) => {
  const camera = useRef();
  const [state] = useStore();
  const { colors } = useTheme();

  const [createStore, setCreateStore] = useState();
  const [mapState, setState] = useState({
    position: undefined,
    initialPosition: undefined,
    location: false,
    followLocation: true,
  });

  const { position, initialPosition, location, followLocation } = mapState;
  const setMap = state => setState({ ...mapState, ...state });

  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({ coords }) =>
        setMap({
          location: true,
          position: [coords.longitude, coords.latitude],
          initialPosition: [coords.longitude, coords.latitude],
        }),
      () =>
        setMap({
          location: false,
          position: CENTER,
          initialPosition: CENTER,
        }),
      {
        timeout: 2000,
      },
    );
  }, [camera.current]);

  useEffect(() => {
    if (selectedStore && camera.current) {
      setCreateStore();
      setMap({ followLocation: false });
      camera.current.flyTo([selectedStore.lng, selectedStore.lat]);
    }
  }, [selectedStore]);

  const moveTo = position => {
    if (!camera.current) {
      return;
    }
    camera.current.setCamera({
      centerCoordinate: position,
      zoomLevel: 13,
      animationDuration: 1500,
    });
  };

  const moveToCurrentLocation = async () => {
    const status = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ]);
    const asked = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });
    if (status[asked] !== 'granted') {
      // TODO: display error message
      setMap({ location: false });
      return;
    }
    Geolocation.getCurrentPosition(({ coords }) => {
      const position = [coords.longitude, coords.latitude];
      moveTo(position);
      setMap({
        location: true,
        position,
        followLocation: true,
      });
    });
  };

  const onMove = ({ properties }) => {
    if (properties.isUserInteraction && followLocation) {
      setMap({ followLocation: false });
    }
  };

  const onUpdateLocation = ({ coords }) => {
    const position = [coords.longitude, coords.latitude];
    if (followLocation) {
      moveTo(position);
    }
    setMap({ position });
  };

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

  const searchPoint = async ({ geometry: { coordinates } }) => {
    const [longitude, latitude] = coordinates;
    onPress();
    setCreateStore({ loading: true, longitude, latitude });
    try {
      const { features } = await searchPlace(longitude, latitude);
      if (!features || !features[0] || !features[0].place_name) {
        setCreateStore({
          error:
            "L'adresse semble invalide, essayez autre part ou contactez-nous",
        });
        return;
      }
      const { place_name: address } = features[0];
      setCreateStore({ address, longitude, latitude });
    } catch (e) {
      setCreateStore({ error: 'Erreur réseau, réessayez plus tard' });
    }
  };

  return (
    <>
      <MapboxGL.MapView
        style={styles.absolute}
        localizeLabels={true}
        pitchEnabled={false}
        styleURL={isDark ? MapboxGL.StyleURL.Dark : undefined}
        onPress={() => onPress()}
        onLongPress={searchPoint}
        compassViewPosition={2}
        onRegionIsChanging={onMove}>
        <MapboxGL.Camera
          ref={camera}
          animationDuration={0}
          centerCoordinate={initialPosition}
          zoomLevel={13}
        />
        <MapboxGL.UserLocation
          onUpdate={onUpdateLocation}
          minDisplacement={10}
        />
        <MapboxGL.ShapeSource
          id="stores"
          shape={storesShape}
          onPress={e => onPress(e.features[0].properties)}>
          <MapboxGL.SymbolLayer
            id="store"
            filter={filters && ['all', ...filters]}
            style={layerStyles.storePrice}
          />
          <MapboxGL.SymbolLayer
            id="storeName"
            belowLayerID="store"
            minZoomLevel={15}
            filter={filters && ['all', ...filters]}
            style={layerStyles.storeName}
          />
        </MapboxGL.ShapeSource>
        {createStore && (
          <MapboxGL.ShapeSource
            id="newStoreSource"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [createStore.longitude, createStore.latitude],
                properties: {},
              },
            }}>
            <MapboxGL.SymbolLayer
              id="newStoreCross"
              style={{
                textField: '✕',
                textSize: 20,
                textColor: theme.colors.primary,
              }}
            />
          </MapboxGL.ShapeSource>
        )}
        {location && (
          <>
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
                belowLayerID="store"
              />
            </MapboxGL.ShapeSource>
          </>
        )}
      </MapboxGL.MapView>
      <FAB
        style={[
          styles.fab,
          { backgroundColor: followLocation ? colors.primary : 'white' },
        ]}
        icon="target"
        color={followLocation ? 'white' : colors.primary}
        onPress={moveToCurrentLocation}
      />
      <FAB
        style={[styles.fab, styles.fabAddStore]}
        icon="plus"
        color={colors.primary}
        onPress={() => setCreateStore({ add: true })}
      />
      <CreateStoreSheet createStore={createStore} onClose={setCreateStore} />
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
  storePrice: {
    iconImage: tooltipIcon,
    iconTranslate: [0, -10],
    iconSize: 0.5,
    iconAllowOverlap: true,
    iconIgnorePlacement: true,
    symbolSortKey: ['get', 'price'],

    textField,
    textColor: '#fff',
    textTranslate: [0, -13],
    textSize: 13,
    textAllowOverlap: false,
    textIgnorePlacement: false,
  },
  storeName: {
    textField: '{name}',
    textSize: 14,
    textAnchor: 'bottom-left',
    textTranslate: [18, -5],
    textHaloColor: '#fff',
    textHaloWidth: 2,
    textAllowOverlap: true,
    textIgnorePlacement: true,
    textOptional: true,
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
    elevation: 0,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
  },
  fabAddStore: {
    bottom: 75,
    backgroundColor: 'white',
  },
});

export default Mapbox;
