import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Caption, Portal, Snackbar } from 'react-native-paper';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { validateStore } from '../../api/stores';
import { sheetStoreState, storeState, userState } from '../../store/atoms';
import { getCoordinatesDistance } from '../../utils/coordinates';
import getLocation from '../../utils/location';

const ERROR_MESSAGES = {
  'position.blocked':
    'La géolocalisation est nécessaire pour cette fonctionnalité',
  'position.denied':
    'La géolocalisation est nécessaire pour cette fonctionnalité',
  'store.validation.position':
    'Vous êtes trop éloigné de ce lieu pour le valider, rapprochez-vous !',
  'store.validation.already': 'Vous avez déjà validé ce lieu, merci encore !',
  'store.validation.ratelimit':
    'Vous êtes trop rapide, attendez un peu avant de valider un nouveau lieu',
};

function getErrorMessage(error) {
  const message = error.message || error;
  return ERROR_MESSAGES[message] || message;
}

function StoreValidate({ id }) {
  const navigation = useNavigation();
  const [state, setState] = useState({ loading: false, error: undefined });
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const store = useRecoilValue(storeState(id));
  const user = useRecoilValue(userState);

  const validate = async () => {
    if (!user) {
      Alert.alert(
        '',
        'Vous devez être connecté pour valider ce bar',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Connexion',
            onPress: () => {
              navigation.navigate('AccountTab');
              setSheetStore();
            },
          },
        ],
        { cancelable: true },
      );
      return;
    }

    setState({ loading: true, error: undefined });
    try {
      const [longitude, latitude] = await getLocation({
        timeout: 5000,
        askedByUser: true,
      });
      const userPosition = { longitude, latitude };
      const distance = getCoordinatesDistance(userPosition, store);
      if (distance > 0.04) {
        throw getErrorMessage('store.validation.position');
      }
      const { error, reputation } = await validateStore(
        store.id,
        userPosition,
        user,
      );
      if (error) {
        throw error;
      }
      setState({ loading: false, error: undefined });
      navigation.navigate('WonReputation', { reputation });
    } catch (err) {
      setState({ loading: false, error: getErrorMessage(err) });
    }
  };

  return (
    <>
      <Button
        mode="outlined"
        style={styles.button}
        onPress={validate}
        loading={state.loading}
        disabled={state.loading}>
        J&apos;y suis
      </Button>
      <Caption style={styles.helpText}>
        En validant votre position à ce bar, vous remerciez les contributeurs
        qui ont participé à la création de cette page.
      </Caption>
      <Portal>
        <Snackbar
          visible={state.error}
          duration={3000}
          action={{
            label: 'OK',
          }}
          onDismiss={() => setState({ loading: false, error: undefined })}>
          {state.error}
        </Snackbar>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 10,
    marginHorizontal: 30,
  },
  helpText: {
    textAlign: 'center',
    marginBottom: 30,
    marginHorizontal: 20,
  },
});

export default StoreValidate;
