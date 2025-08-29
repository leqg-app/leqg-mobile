import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Divider } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAtom } from 'jotai';

import { deleteProfile } from '../../api/users';
import { getErrorMessage } from '../../utils/errorMessage';
import { userState } from '../../store/atoms';
import * as signOutProviders from './Providers/index.js';

const Profile = ({ navigation }) => {
  const [user, setUser] = useAtom(userState);
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
      await deleteProfile(user.jwt);
      signOutProviders[user.provider]?.signOut?.();
      setUser(null);
      setState({ error: undefined, loading: false });
      navigation.navigate('AnonymStack');
    } catch (err) {
      setState({ error: getErrorMessage(err), loading: false });
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
      {state.error && <HelperText type="error">{state.error}</HelperText>}
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
