import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAtomValue, useSetAtom } from 'jotai';

import ActionSheet from '../../components/ActionSheet';
import ActionButtons from '../../components/ActionButtons';
import { storeEditionState, userState } from '../../store/atoms';

function getStateText(createStore) {
  if (!createStore) {
    return '';
  }
  const { loading, add, error, address } = createStore;
  if (error) {
    return error;
  }
  if (loading) {
    return 'Chargement...';
  }
  if (add) {
    return 'Cliquez longuement sur la carte pour sélectionner le lieu du bar';
  }
  return address || '';
}

const CreateStoreSheet = ({ createStore, onClose }) => {
  const navigation = useNavigation();
  const sheet = useRef();
  const user = useAtomValue(userState);
  const setStoreEdition = useSetAtom(storeEditionState);

  const close = React.useCallback(() => {
    sheet.current?.close?.();
    onClose();
  });

  const submit = () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour ajouter un nouveau bar',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Connexion',
            onPress: () => {
              navigation.navigate('TabNavigator', {
                screen: 'AccountTab',
              });
              close();
            },
          },
        ],
        { cancelable: true },
      );
      return;
    }
    setStoreEdition(createStore);
    navigation.navigate('EditStoreScreen', {
      screen: 'EditStore',
      params: { store: createStore },
    });
  };

  useEffect(() => {
    if (!sheet.current) {
      return;
    }
    if (createStore) {
      sheet.current.snapToIndex(0);
    } else {
      sheet.current.close();
    }
  }, [createStore]);

  return (
    <ActionSheet ref={sheet} onDismiss={close}>
      <View style={styles.createStoreSheet}>
        <Title>Ajouter un nouveau bar</Title>
        <Text>{getStateText(createStore)}</Text>
        <ActionButtons
          onCancel={close}
          onSubmit={submit}
          submitLabel="Ajouter"
          disabled={!createStore?.address}
        />
      </View>
    </ActionSheet>
  );
};

const styles = StyleSheet.create({
  createStoreSheet: {
    paddingHorizontal: 20,
  },
});

export default CreateStoreSheet;
