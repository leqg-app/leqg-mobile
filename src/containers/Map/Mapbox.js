import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, StyleSheet, View } from 'react-native';
import MapboxGL, { Images, Logger } from '@rnmapbox/maps';
import circle from '@turf/circle';
import { FAB, useTheme } from 'react-native-paper';
import Config from 'react-native-config';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import tooltipIcon from '../../assets/tooltip-50.png';
import { DEFAULT_MAP, theme } from '../../constants';
import searchPlace from '../../utils/searchPlace';
import CreateStoreSheet from './CreateStoreSheet';
import { storage } from '../../store/storage';
import getLocation from '../../utils/location';
import { sheetStoreState, storesMapState } from '../../store/atoms';
import { mapboxState, mapBoundsState } from '../../store/filterAtoms';
import { getErrorMessage } from '../../utils/errorMessage';

// MapboxGL.setWellKnownTileServer('mapbox');
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

const isDarkMode = Appearance.getColorScheme() === 'dark';
const storedMapPosition = storage.getObject('mapPosition', {});

const Mapbox = () => {
  const camera = useRef();
  const { colors } = useTheme();
  const stores = useAtomValue(storesMapState);
  const [sheetStore, setSheetStore] = useAtom(sheetStoreState);
  const { filters, textField, symbolSortKey, textSize } =
    useAtomValue(mapboxState);
  const setMapBounds = useSetAtom(mapBoundsState);

  const [createStore, setCreateStore] = useState();
  const [mapState, setState] = useState({
    position: undefined,
    initialPosition: storedMapPosition.coordinates,
    initialZoomLevel: storedMapPosition.zoom,
    isLocated: false,
  });

  const { position, initialPosition, initialZoomLevel } = mapState;

  const setMap = state => setState({ ...mapState, ...state });

  useEffect(() => {
    // At start, get location
    // If no initial position yet, use location
    (async () => {
      try {
        const position = await getLocation();
        setMap({
          position,
          initialPosition: position,
          initialZoomLevel: 13,
        });
      } catch {
        setMap({
          position: undefined,
          ...(!initialPosition && {
            initialPosition: DEFAULT_MAP.CENTER_COORDINATES,
            initialZoomLevel: DEFAULT_MAP.ZOOM_LEVEL,
          }),
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!sheetStore?.focus || !camera.current) {
      return;
    }
    setCreateStore();
    const timeout = setTimeout(() => {
      camera.current.setCamera({
        centerCoordinate: [sheetStore.longitude, sheetStore.latitude],
        zoomLevel: 17,
        animationDuration: 1000,
      });
    }, 100);
    return () => clearTimeout(timeout);
  }, [sheetStore]);

  useEffect(() => {
    layerStyles.storeName.textColor = colors.onBackground;
    layerStyles.storeName.textHaloColor = colors.onSecondary;
    layerStyles.nearLine.lineColor = colors.primary;
    layerStyles.nearText.textColor = colors.primary;
    layerStyles.nearText.textHaloColor = colors.primary;
  }, [colors]);

  const moveTo = centerCoordinate => {
    if (!camera.current) {
      return;
    }
    camera.current.setCamera({
      centerCoordinate,
      zoomLevel: 15,
      animationDuration: 1500,
    });
  };

  const moveToCurrentLocation = async () => {
    try {
      const position = await getLocation({ timeout: 5000, askedByUser: true });
      moveTo(position);
      setMap({ position });
    } catch {
      setMap({ position: undefined });
    }
  };

  const onMapPress = () => {
    if (sheetStore) {
      setSheetStore();
    }
    if (createStore) {
      setCreateStore();
    }
  };

  const didMove = ({ properties }) => {
    storage.setObject('mapPosition', {
      coordinates: properties.center,
      zoom: properties.zoom,
    });
    if (properties.bounds) {
      setMapBounds(properties.bounds);
    }
  };

  const onUpdateLocation = ({ coords }) => {
    if (!coords?.longitude || !coords?.latitude) {
      return;
    }
    setMap({ position: [coords.longitude, coords.latitude] });
  };

  const storeStyle = useMemo(
    () => ({ ...layerStyles.storePrice, textField, symbolSortKey, textSize }),
    [textField, symbolSortKey, textSize],
  );

  if (!initialPosition) {
    return <View />;
  }

  const searchPoint = async ({ geometry: { coordinates } }) => {
    const [longitude, latitude] = coordinates;
    setSheetStore();
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
    } catch (err) {
      setCreateStore({ error: getErrorMessage(err) });
    }
  };

  return (
    <>
      <MapboxGL.MapView
        style={styles.absolute}
        localizeLabels={true}
        pitchEnabled={false}
        rotateEnabled={false}
        scaleBarPosition={{ left: 10, bottom: 40 }}
        styleURL={isDarkMode ? MapboxGL.StyleURL.Dark : undefined}
        onPress={onMapPress}
        onLongPress={searchPoint}
        onCameraChanged={didMove}>
        <MapboxGL.Camera
          ref={camera}
          animationDuration={0}
          centerCoordinate={initialPosition}
          zoomLevel={initialZoomLevel}
        />
        <MapboxGL.UserLocation
          onUpdate={onUpdateLocation}
          minDisplacement={10}
          animated={false} // https://github.com/rnmapbox/maps/issues/4060
        />
        <MapboxGL.ShapeSource
          id="stores"
          shape={stores}
          onPress={e => setSheetStore(e.features[0].properties)}>
          <Images images={{ tooltipIcon }} />
          <MapboxGL.SymbolLayer
            id="store"
            filter={['all', ...filters]}
            style={storeStyle}
          />
          <MapboxGL.SymbolLayer
            id="storeName"
            filter={['all', ...filters]}
            belowLayerID="store"
            minZoomLevel={10}
            style={layerStyles.storeName}
          />
        </MapboxGL.ShapeSource>

        <MapboxGL.ShapeSource
          id="storeFocus"
          shape={{
            type: 'FeatureCollection',
            features: sheetStore
              ? [
                  {
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [sheetStore.longitude, sheetStore.latitude],
                    },
                    properties: sheetStore,
                  },
                ]
              : [],
          }}>
          <MapboxGL.CircleLayer
            id="storeFocusCircle"
            aboveLayerID="store"
            style={layerStyles.focusStore}
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
                textColor: colors.primary,
              }}
            />
          </MapboxGL.ShapeSource>
        )}
        {position && (
          <>
            <MapboxGL.ShapeSource id="near15" shape={circle(position, 1)}>
              <MapboxGL.SymbolLayer
                id="nearText15"
                belowLayerID="store"
                style={{ ...layerStyles.nearText, textField: '15 MIN' }}
                minZoomLevel={11}
              />
              <MapboxGL.LineLayer
                id="nearLine15"
                minZoomLevel={11}
                style={layerStyles.nearLine}
              />
            </MapboxGL.ShapeSource>
            <MapboxGL.ShapeSource id="near5" shape={circle(position, 0.25)}>
              <MapboxGL.SymbolLayer
                id="nearText5"
                belowLayerID="store"
                style={{ ...layerStyles.nearText, textField: '5 MIN' }}
                minZoomLevel={14.5}
              />
              <MapboxGL.LineLayer
                id="nearLine5"
                minZoomLevel={14.5}
                style={layerStyles.nearLine}
              />
            </MapboxGL.ShapeSource>
          </>
        )}
      </MapboxGL.MapView>
      <View style={styles.fabContainer}>
        <FAB
          variant="surface"
          style={[styles.fab, styles.fabAddStore]}
          icon="plus"
          color={colors.primary}
          onPress={() => setCreateStore({ add: true })}
        />
        <FAB
          variant="surface"
          style={styles.fab}
          icon="target"
          color={colors.primary}
          onPress={moveToCurrentLocation}
        />
      </View>
      <CreateStoreSheet createStore={createStore} onClose={setCreateStore} />
    </>
  );
};

const layerStyles = {
  storePrice: {
    iconImage: 'tooltipIcon',
    iconTranslate: [0, -10],
    iconSize: 0.5,
    iconAllowOverlap: true,
    iconIgnorePlacement: true,

    textColor: '#fff',
    textTranslate: [0, -13],
  },
  storeName: {
    textField: ['get', 'name'],
    textSize: 12,
    textTranslate: [0, -11],
    textHaloWidth: 2,
    textJustify: 'auto',
    // textOptional: true,
    textVariableAnchor: [
      'left',
      'right',
      'top',
      'bottom',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ],
    textRadialOffset: 1.4,
  },
  nearLine: {
    lineWidth: 1.4,
    lineOpacity: 0.84,
    lineDasharray: [5, 5],
  },
  nearText: {
    symbolPlacement: 'line-center',
    textSize: 13,
    textHaloWidth: 0.4,
    textOffset: [0, 1],
    textLetterSpacing: 0.1,
  },
  focusStore: {
    circleRadius: 6,
    circleColor: theme.colors.primary,
    circleOpacity: 0.5,
    circleStrokeWidth: 3,
    circleStrokeColor: theme.colors.primary,
    circleTranslate: [0, 1],
  },
};

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 16,
  },
  fab: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  fabAddStore: {
    marginBottom: 10,
  },
});

export default Mapbox;
