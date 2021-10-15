import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { useStore } from '../../store/context';

MapboxGL.setAccessToken('');

const CENTER = [2.341924, 48.860395];

const Mapbox = ({ filters, onPress }) => {
  const [state, actions] = useStore();
  const [coordinates, setCoordinates] = useState({});

  useEffect(() => {
    if (!state.loading && coordinates.northEast) {
      actions.getStores(coordinates);
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

  const regionChanged = ({ properties }) => {
    const [northEast, southWest] = properties.visibleBounds;
    setCoordinates({ northEast, southWest });
  };

  return (
    <MapboxGL.MapView
      style={styles.absolute}
      localizeLabels={true}
      rotateEnabled={false}
      pitchEnabled={false}
      onRegionDidChange={regionChanged}
      onPress={() => onPress()}>
      <MapboxGL.Camera zoomLevel={11} centerCoordinate={CENTER} />
      <MapboxGL.UserLocation />
      <MapboxGL.ShapeSource
        id="earthquakes"
        shape={storesShape}
        onPress={e => onPress(e.features[0].properties)}>
        <MapboxGL.CircleLayer
          id="singlePoint"
          filter={filters && ['all', ...filters]}
          style={mapStyle.pointCircle}
        />
        <MapboxGL.SymbolLayer
          id="singlePointCount"
          aboveLayerID="singlePoint"
          filter={filters && ['all', ...filters]}
          style={mapStyle.priceText}
        />
      </MapboxGL.ShapeSource>
    </MapboxGL.MapView>
  );
};

const mapStyle = {
  pointCircle: {
    circleColor: 'green',
    circleRadius: ['interpolate', ['linear'], ['zoom'], 10, 5, 13, 10],
  },
  priceText: {
    textField: ['to-string', ['get', 'price']],
    textSize: ['interpolate', ['linear'], ['zoom'], 10, 5, 13, 9],
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
