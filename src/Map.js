import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { useStore } from './store/context';

const Map = () => {
  const [state, actions] = useStore();

  useEffect(() => {
    actions.getStores();
  }, []);

  console.log(state);

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 48.860395,
        longitude: 2.341924,
        latitudeDelta: 0.243,
        longitudeDelta: 0.134,
      }}>
      {state.stores.map(store => (
        <Marker
          key={store.name}
          coordinate={{
            latitude: store.latitude,
            longitude: store.longitude,
          }}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Map;
