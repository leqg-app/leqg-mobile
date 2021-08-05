import React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {
  Appbar,
  Button,
  Dialog,
  Portal,
  Paragraph,
  TextInput,
} from 'react-native-paper';

import { useStore } from './store/context';

const AddStore = ({ route, navigation }) => {
  const [state, actions] = useStore();

  const [name, onChangeName] = React.useState('');
  const [address, onChangeAddress] = React.useState('');
  const [geometry, setGeometry] = React.useState('');

  const [error, setError] = React.useState(false);

  const validForm = name && address && geometry;

  const save = async () => {
    if (!validForm) {
      setError('Missing field');
      return;
    }
    const { lat: latitude, lng: longitude } = geometry;
    actions.addStore({
      name,
      address,
      longitude,
      latitude,
      author: state.user.id,
    });
  };

  const goToLogin = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });

  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.toggleDrawer()} />
        <Appbar.Content title="Ajouter" />
        <Appbar.Action
          disabled={!validForm || state.loading}
          icon="send"
          onPress={save}
        />
      </Appbar.Header>
      <View style={styles.box}>
        <TextInput
          style={{ marginVertical: 15, backgroundColor: 'transparent' }}
          label="Nom"
          mode="flat"
          textContentType="name"
          onChangeText={onChangeName}
          value={name}
        />
        <GooglePlacesAutocomplete
          debounce={100}
          onPress={(data, details) => {
            onChangeAddress(data.description);
            setGeometry(details.geometry.location);
          }}
          fetchDetails={true}
          value={address}
          query={{
            key: '',
            language: 'fr',
            components: 'country:fr',
          }}
          enablePoweredByContainer={false}
          textInputProps={{
            InputComp: TextInput,
            mode: 'flat',
            label: 'Adresse',
            onChangeText: () => setGeometry(false),
          }}
          styles={{
            container: {
              height: 60,
            },
            textInputContainer: {
              height: 70,
            },
            textInput: {
              backgroundColor: 'transparent',
              height: 60,
              fontSize: 16,
              paddingLeft: 1,
            },
            listView: {
              marginTop: 70,
              position: 'absolute',
            },
          }}
        />
      </View>
      <Portal>
        <Dialog
          visible={route.name === 'Add' && !state.token}
          onDismiss={goToLogin}>
          <Dialog.Content>
            <Paragraph>Vous devez être connecté pour ajouter</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={goToLogin}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 20,
  },
});

export default AddStore;
