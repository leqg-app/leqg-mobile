import React, { useEffect, useRef } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { Button, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import ActionSheet from '../../components/ActionSheet';

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

  useEffect(() => {
    if (createStore) {
      sheet.current.snapToIndex(0);
    } else {
      sheet.current.close();
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (createStore) {
          onClose();
          sheet.current.close();
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove();
  }, [createStore]);

  return (
    <ActionSheet ref={sheet}>
      <View style={styles.createStoreSheet}>
        <Title>Ajouter un nouveau bar</Title>
        <Text>{getStateText(createStore)}</Text>
        <View style={styles.actions}>
          <Button
            mode="outlined"
            style={styles.actionsButton}
            onPress={() => {
              onClose();
              sheet.current.close();
            }}>
            Annuler
          </Button>
          <Button
            mode="contained"
            style={styles.actionsButton}
            disabled={!createStore?.address}
            onPress={() =>
              navigation.navigate('EditStoreScreen', {
                screen: 'EditStore',
                params: { store: createStore },
              })
            }>
            Ajouter
          </Button>
        </View>
      </View>
    </ActionSheet>
  );
};

const styles = StyleSheet.create({
  createStoreSheet: {
    paddingHorizontal: 20,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  actionsButton: {
    borderRadius: 99,
    width: '40%',
  },
});

export default CreateStoreSheet;
