import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Searchbar } from 'react-native-paper';

import { useStore } from './store/context';

const Map = ({ navigation }) => {
  const [state, actions] = useStore();
  const [text, onChangeText] = React.useState('');
  const [coordinates, onChangeCoordinates] = React.useState({
    latitude: 48.860395,
    longitude: 2.341924,
    latitudeDelta: 0.243,
    longitudeDelta: 0.134,
  });

  console.log(coordinates);

  useEffect(() => {
    actions.getStores();
  }, []);

  return (
    <SafeAreaView style={styles.absolute}>
      <MapView
        style={styles.absolute}
        initialRegion={coordinates}
        onRegionChangeComplete={a => onChangeCoordinates(a)}>
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
        style={styles.searchbar}
        icon="menu"
        onIconPress={() => navigation.toggleDrawer()}
        placeholder="Rechercher"
        onChangeText={onChangeText}
        value={text}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  searchbar: {
    elevation: 2,
    color: 'white',
    margin: 20,
    borderRadius: 30,
    height: 45,
    paddingLeft: 10,
  },
});

export default Map;
