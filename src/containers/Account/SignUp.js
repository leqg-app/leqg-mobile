import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Paragraph, TextInput, Button, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSetRecoilState } from 'recoil';

import { userState } from '../../store/atoms';
import * as api from '../../api/users';

const errors = {
  'user.email.taken':
    'Cette adresse email est déjà utilisée, essayez de vous connecter',
  'user.username.taken':
    "Ce nom d'utilisateur est déjà utilisé, choisissez-en un autre",
  'Network request failed': 'Vérifiez votre connexion internet',
};

const SignUp = ({ navigation }) => {
  const setUser = useSetRecoilState(userState);
  const emailInput = useRef();
  const passwordInput = useRef();

  const [state, setState] = useState({
    error: undefined,
    loading: false,
  });

  const [username, onChangeUsername] = useState('');
  const [email, onChangeEmail] = useState('');
  const [password, onChangePassword] = useState('');

  const signUp = async () => {
    setState({ error: undefined, loading: true });
    try {
      const { error, ...user } = await api.signUp({
        username,
        email,
        password,
      });
      if (error) {
        throw error;
      }
      setUser(user);
    } catch (error) {
      setState({ error, loading: false });
    }
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="always"
      contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Paragraph>
          Inscrivez-vous et profitez de tous les avantages des membres
        </Paragraph>
        <TextInput
          style={styles.space}
          label="Pseudo"
          mode="outlined"
          textContentType="nickname"
          returnKeyType="next"
          onChangeText={onChangeUsername}
          value={username}
          onSubmitEditing={() => emailInput.current.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          ref={emailInput}
          style={styles.space}
          label="E-mail"
          mode="outlined"
          returnKeyType="next"
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          onChangeText={onChangeEmail}
          value={email}
          onSubmitEditing={() => passwordInput.current.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          ref={passwordInput}
          style={styles.space}
          label="Mot de passe"
          mode="outlined"
          textContentType="password"
          returnKeyType="done"
          onChangeText={onChangePassword}
          value={password}
          secureTextEntry
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
          onPress={signUp}
          loading={state.loading}
          disabled={!username || !email || !password}>
          Inscription
        </Button>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Déjà un compte ?</Text>
        <Button
          style={styles.space}
          mode="text"
          onPress={() => navigation.replace('SignIn')}
          uppercase={false}>
          Connexion
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
  },
  form: {
    flex: 1,
    // justifyContent: 'center',
  },
  space: {
    marginTop: 15,
  },
  footer: {
    height: 70,
  },
  footerText: {
    textAlign: 'center',
  },
});

export default SignUp;