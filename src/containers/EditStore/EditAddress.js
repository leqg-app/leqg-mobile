import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Searchbar } from 'react-native-paper';
import Config from 'react-native-config';
import { useAtom } from 'jotai';

import { getCountryCode } from '../../utils/searchPlace';
import { storeEditionState } from '../../store/atoms';

const EditAddress = ({ navigation }) => {
  const [storeEdition, setStoreEdition] = useAtom(storeEditionState);
  const addressInput = useRef();

  useEffect(() => {
    // addressInput.current.focus();
  }, []);

  return (
    <SafeAreaView>
      <GooglePlacesAutocomplete
        ref={addressInput}
        debounce={100}
        onPress={(data, details) => {
          const { lat: latitude, lng: longitude } = details.geometry.location;
          setStoreEdition({
            ...storeEdition,
            address: data.description,
            latitude,
            longitude,
            countryCode: getCountryCode(details.address_components),
          });
          navigation.goBack();
        }}
        fetchDetails={true}
        query={{
          key: Config.GOOGLE_MAPS_API_KEY,
          language: 'fr',
        }}
        textInputProps={{
          InputComp: Searchbar,
          placeholder: 'Rechercher une adresse',
          returnKeyType: 'done',
          style: {
            height: 61,
            width: '100%',
            borderRadius: 0,
          },
          clearButtonMode: 'never',
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
