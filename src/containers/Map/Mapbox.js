import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from 'react-native-geolocation-service';

import { useStore } from '../../store/context';

MapboxGL.setAccessToken(
  'pk.eyJ1IjoibmljbzJjaGUiLCJhIjoiY2lzYm5zcHAzMDAxNDJvbWtwb3dyY2ZuYiJ9.eSWQhgnzx-RQWqSx5ltXcg',
);

const CENTER = [2.341924, 48.860395];

const Mapbox = ({ filters, onPress }) => {
  const map = useRef();
  const [state, actions] = useStore();
  const [position, setPosition] = useState(undefined);
  const [coordinates, setCoordinates] = useState({});

  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
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
        actions.getStores({ northEast: [3, 49], southWest: [2, 48] });
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
          coordinates: [store.longitude, store.latitude],
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
    <MapboxGL.MapView
      ref={map}
      style={styles.absolute}
      localizeLabels={true}
      rotateEnabled={false}
      pitchEnabled={false}
      onRegionDidChange={regionChanged}
      onPress={() => onPress()}>
      <MapboxGL.Camera zoomLevel={13} centerCoordinate={position} />
      <MapboxGL.UserLocation minDisplacement={500} />
      <MapboxGL.ShapeSource
        id="stores"
        shape={storesShape}
        onPress={e => onPress(e.features[0].properties)}>
        <MapboxGL.CircleLayer
          id="pointCircle"
          filter={filters && ['all', ...filters]}
          style={mapStyle.pointCircle}
        />
        <MapboxGL.SymbolLayer
          id="priceText"
          aboveLayerID="pointCircle"
          filter={['all', ['>', ['zoom'], 10.5], ...filters]}
          style={mapStyle.priceText}
        />
      </MapboxGL.ShapeSource>
    </MapboxGL.MapView>
  );
};

const mapStyle = {
  pointCircle: {
    circleColor: 'green',
    circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 10],
  },
  priceText: {
    textField: ['to-string', ['get', 'price']],
    textSize: ['interpolate', ['linear'], ['zoom'], 10, 3, 13, 9],
    textMaxWidth: 50,
    textColor: '#FFF',
    textAnchor: 'center',
    textTranslate: [0, 0],
    textAllowOverlap: true,
  },
};

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});

export default Mapbox;
