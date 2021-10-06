import React, { useEffect, useRef } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Appbar, Searchbar } from 'react-native-paper';

import Header from './components/Header';
import { useStore } from './store/context';

const SelectAddress = ({ navigation }) => {
  const [, actions] = useStore();
  const addressInput = useRef();

  useEffect(() => {
    addressInput.current.focus();
  }, []);

  return (
    <SafeAreaView>
      <Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Adresse" />
      </Header>
      <View>
        <GooglePlacesAutocomplete
          ref={addressInput}
          debounce={100}
          onPress={(data, details) => {
            const { lat: latitude, lng: longitude } = details.geometry.location;
            actions.setStoreEdition({
              address: data.description,
              latitude,
              longitude,
            });
            navigation.goBack();
          }}
          fetchDetails={true}
          query={{
            key: 'AIzaSyCpXXL23U8rQ4eQDBKDY534xWz_uv8YdHE',
            language: 'fr',
            components: 'country:fr',
          }}
          enablePoweredByContainer={false}
          textInputProps={{
            InputComp: Searchbar,
            placeholder: 'Rechercher une adresse',
            returnKeyType: 'done',
            style: {
              height: 50,
              width: '100%',
            },
          }}
          styles={{
            listView: {
              position: 'absolute',
              marginTop: 51,
            },
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default SelectAddress;
