import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Title, TextInput, Button, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { resetPassword } from '../../api/users';
import { getErrorMessage } from '../../utils/errorMessage';

const ERROR_MESSAGES = {
  'email.format': 'Adresse email invalide',
  'user.not-exist': "Cet email n'a pas de compte",
  'user.blocked':
    "Ce compte a été désactivé, contactez-nous pour plus d'information",
};

const ResetPassword = ({ navigation }) => {
  const [state, setState] = useState({
    error: undefined,
    loading: false,
  });

  const [email, setEmail] = useState('');

  const submit = async () => {
    if (!email) {
      setState({ error: "L'email est obligatoire", loading: false });
      return;
    }
    setState({ error: undefined, loading: true });
    try {
      const { error } = await resetPassword({ email });
      if (error) {
        throw error;
      }
    } catch (err) {
      setState({ error: getErrorMessage(err, ERROR_MESSAGES), loading: false });
      return;
    }
    setState({ loading: false });
    Alert.alert(
      'Envoyé !',
      'Vérifiez vos emails, vous trouverez un lien pour changer de mot de passe.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="always">
      <Title>Mot de passe oublié</Title>
      <TextInput
        style={styles.space}
        label="E-mail"
        mode="outlined"
        returnKeyType="done"
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      {state.error && <HelperText type="error">{state.error}</HelperText>}
      <Button
        style={styles.space}
        mode="contained"
        onPress={submit}
        loading={state.loading}
        disabled={!email}>
        Réinitialiser
      </Button>
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
    marginTop: 15,
  },
});

export default ResetPassword;
