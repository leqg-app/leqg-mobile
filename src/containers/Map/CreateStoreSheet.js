import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

  const close = React.useCallback(() => {
    sheet.current.close();
    onClose();
  });

  useEffect(() => {
    if (createStore) {
      sheet.current.snapToIndex(0);
    } else {
      sheet.current?.close();
    }
  }, [createStore]);

  return (
    <ActionSheet ref={sheet} onDismiss={close}>
      <View style={styles.createStoreSheet}>
        <Title>Ajouter un nouveau bar</Title>
        <Text>{getStateText(createStore)}</Text>
        <ActionButtons
          onCancel={close}
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
