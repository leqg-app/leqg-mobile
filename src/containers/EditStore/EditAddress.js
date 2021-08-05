import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Searchbar } from 'react-native-paper';

import { useStore } from '../../store/context';

const EditAddress = ({ navigation }) => {
  const [, actions] = useStore();
  const addressInput = useRef();

  useEffect(() => {
    addressInput.current.focus();
  }, []);

  return (
    <SafeAreaView>
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
          key: '',
          language: 'fr',
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
    </SafeAreaView>
  );
};

export default EditAddress;
