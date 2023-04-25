import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Divider } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRecoilState } from 'recoil';

import { deleteProfile } from '../../api/users';
import { reportError } from '../../utils/errorMessage';
import { userState } from '../../store/atoms';
import * as signOutProviders from './Providers/index.js';

const errors = {
  'Network request failed': 'Vérifiez votre connexion internet',
};

const Profile = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [state, setState] = useState({
    error: undefined,
    loading: false,
  });

  const confirmDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer votre compte ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: deleteAccount,
        },
      ],
    );
  };

  const deleteAccount = async () => {
    setState({ error: undefined, loading: true });
    try {
      const { error } = await deleteProfile(user.jwt);
      if (error) {
        setState({ error, loading: false });
        return;
      }
      signOutProviders[user.provider]?.signOut?.();
      setUser(null);
      navigation.goBack();
    } catch (err) {
      reportError(err);
      setState({ error: err.message, loading: false });
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="always">
      <TextInput
        label="Pseudo"
        mode="outlined"
        disabled
        value={user?.username}
      />
      <HelperText>
        Il n&apos;est pas possible pour le moment de modifier son pseudo.
      </HelperText>
      <Divider style={styles.divider} />
      <HelperText>
        Supprimer votre compte effacera vos informations personnelles de notre
        base de données.
      </HelperText>
      <Button
        style={styles.space}
        mode="contained"
        onPress={confirmDelete}
        loading={state.loading}
        disabled={state.loading}>
        Supprimer mon compte
      </Button>
      {state.error && (
        <HelperText type="error">
          {errors[state.error] ||
            'Erreur inconnue, nous avons été informés. Merci de réessayer plus tard'}
        </HelperText>
      )}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  divider: {
    marginVertical: 15,
  },
  space: {
    marginTop: 5,
  },
});

export default Profile;
