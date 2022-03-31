import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL, { Logger } from '@react-native-mapbox-gl/maps';
import circle from '@turf/circle';
import { FAB, useTheme } from 'react-native-paper';
import Config from 'react-native-config';

import tooltipIcon from '../../assets/tooltip-50.png';
import { isDark, theme } from '../../constants';
import { useStore } from '../../store/context';
import searchPlace from '../../utils/searchPlace';
import CreateStoreSheet from './CreateStoreSheet';
import { storage } from '../../store/storage';
import getLocation from '../../utils/location';

MapboxGL.setAccessToken(Config.MAPBOX_API_KEY);

// https://github.com/react-native-mapbox-gl/maps/issues/943
if (__DEV__) {
  Logger.setLogCallback(log => {
    const { message } = log;
    if (
      message.match('Request failed due to a permanent error: Canceled') ||
      message.match('Unable to resolve host')
    ) {
      return true;
    }
    return false;
  });
}

const CENTER = [2.341924, 48.860395];
const storedMapPosition = storage.getObject('mapPosition', {});

const Mapbox = ({ filters, onPress, selectedStore }) => {
  const camera = useRef();
  const [state] = useStore();
  const { colors } = useTheme();

  const [createStore, setCreateStore] = useState();
  const [mapState, setState] = useState({
    position: undefined,
    initialPosition: storedMapPosition.coordinates,
    initialZoomLevel: storedMapPosition.zoom,
    isLocated: false,
    isFollowing: storedMapPosition.followUser || false,
  });

  const { position, isFollowing, initialPosition, initialZoomLevel } = mapState;

  const setMap = state => setState({ ...mapState, ...state });

  useEffect(() => {
    // At start, get location
    // If no initial position yet, use location
    (async () => {
      try {
        const position = await getLocation();
        setMap({
          position,
          ...(!initialPosition && {
            initialPosition: position,
            initialZoomLevel: 13,
            isFollowing: true,
          }),
        });
      } catch (e) {
        setMap({
          position: undefined,
          ...(!initialPosition && {
            initialPosition: CENTER,
            initialZoomLevel: 7,
            isFollowing: false,
          }),
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedStore && camera.current) {
      setCreateStore();
      setMap({ isFollowing: false });
      camera.current.flyTo([selectedStore.lng, selectedStore.lat]);
    }
  }, [selectedStore]);

  const moveTo = centerCoordinate => {
    if (!camera.current) {
      return;
    }
    camera.current.setCamera({
      centerCoordinate,
      zoomLevel: 13,
      animationDuration: 1500,
    });
  };

  const moveToCurrentLocation = async () => {
    try {
      const position = await getLocation({ timeout: 3000 });
      moveTo(position);
      setMap({
        position,
        isFollowing: true,
      });
    } catch (e) {
      console.log(e);
      // TODO: display error message
      setMap({ position: undefined });
    }
  };

  const onMove = ({ properties }) => {
    if (properties.isUserInteraction && isFollowing) {
      setMap({ isFollowing: false });
    }
  };

  const didMove = ({ geometry, properties }) => {
    const { coordinates } = geometry;
    const { isUserInteraction, zoomLevel } = properties;
    storage.setObject('mapPosition', {
      ...mapState,
      followUser: isFollowing && isUserInteraction ? false : isFollowing,
      coordinates,
      zoom: zoomLevel,
    });
  };

  const onUpdateLocation = ({ coords }) => {
    const position = [coords.longitude, coords.latitude];
    if (isFollowing) {
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

  if (!initialPosition) {
    return <View />;
  }

  const searchPoint = async ({ geometry: { coordinates } }) => {
    const [longitude, latitude] = coordinates;
    onPress();
    setCreateStore({ loading: true, longitude, latitude });
    try {
      const { address, countryCode } = await searchPlace(longitude, latitude);
      if (!address) {
        setCreateStore({
          error:
            "L'adresse semble invalide, essayez autre part ou contactez-nous",
        });
        return;
      }
      setCreateStore({ address, countryCode, longitude, latitude });
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
        onRegionIsChanging={onMove}
        onRegionDidChange={didMove}>
        <MapboxGL.Camera
          ref={camera}
          animationDuration={0}
          centerCoordinate={initialPosition}
          zoomLevel={initialZoomLevel}
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
        {position && (
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
          { backgroundColor: isFollowing ? colors.primary : 'white' },
        ]}
        icon="target"
        color={isFollowing ? 'white' : colors.primary}
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
