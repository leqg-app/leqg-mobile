import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Searchbar } from 'react-native-paper';

import { useStore } from './store/context';

const Map = ({ navigation }) => {
  const [state, actions] = useStore();
  const [text, onChangeText] = React.useState('Paris');

  useEffect(() => {
    actions.getStores();
  }, []);

  return (
    <View style={styles.vv}>
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
      <Searchbar
        style={{
          elevation: 0,
          color: 'white',
        }}
        icon="menu"
        onIconPress={() => navigation.toggleDrawer()}
        placeholder="Search"
        onChangeText={onChangeText}
        value={text}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  vv: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});

export default Map;
