import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Title, TextInput, Button, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { resetPassword } from '../../api/users';
import { reportError } from '../../utils/errorMessage';

const errors = {
  'Network request failed': 'Vérifiez votre connexion internet',
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
        setState({ error, loading: false });
        return;
      }
    } catch (err) {
      reportError(err);
      setState({ error: err.message, loading: false });
      return;
    }
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
      {state.error && (
        <HelperText type="error">
          {errors[state.error] ||
            'Erreur inconnue, nous avons été informés. Merci de réessayer plus tard'}
        </HelperText>
      )}
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
