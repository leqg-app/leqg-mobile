import React, { useEffect, useRef } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import ActionSheet from '../../components/ActionSheet';
import ActionButtons from '../../components/ActionButtons';

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
        <ActionButtons
          onCancel={() => {
            onClose();
            sheet.current.close();
          }}
          onSubmit={() =>
            navigation.navigate('EditStoreScreen', {
              screen: 'EditStore',
              params: { store: createStore },
            })
          }
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
