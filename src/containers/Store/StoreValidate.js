import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Caption, Portal, Snackbar } from 'react-native-paper';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { validateStore } from '../../api/stores';
import { sheetStoreState, storeState, userState } from '../../store/atoms';
import { getCoordinatesDistance } from '../../utils/coordinates';
import getLocation from '../../utils/location';
import { getErrorMessage } from '../../utils/errorMessage';

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

function StoreValidate({ id }) {
  const navigation = useNavigation();
  const [state, setState] = useState({ loading: false, error: undefined });
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const [store, setStore] = useRecoilState(storeState(id));
  const user = useRecoilValue(userState);

  if (!store.validations) {
    return <View />;
  }

  const alreadyValidated = store.validations.some(
    validation => validation.user.id === user.id,
  );

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
        throw 'store.validation.position';
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
      setStore(store => ({
        ...store,
        validations: store.validations.concat({ user: { id: user.id } }),
      }));
      navigation.navigate('WonReputation', { reputation });
    } catch (err) {
      setState({ loading: false, error: getErrorMessage(err, ERROR_MESSAGES) });
    }
  };

  return (
    <>
      {!alreadyValidated ? (
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
            En validant votre position à ce bar, vous remerciez les
            contributeurs qui ont participé à la création de cette page.
          </Caption>
        </>
      ) : (
        <Button mode="outlined" style={styles.button} icon="check" disabled>
          Validé
        </Button>
      )}
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
