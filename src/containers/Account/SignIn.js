import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSetRecoilState } from 'recoil';

import { userState } from '../../store/atoms';
import * as api from '../../api/users';
import GoogleAuth from './Providers/GoogleAuth';
import AppleAuth from './Providers/AppleAuth';
import { reportError } from '../../utils/errorMessage';

const errors = {
  'user.credentials': 'Identifiant ou mot de passe incorrect',
  'user.confirmed': 'Confirmez votre email afin de vous connecter',
  'user.blocked':
    "Ce compte a été désactivé, contactez-nous pour plus d'information",
  'user.provider':
    "Ce compte n'a pas de mot de passe, utilisez le moyen de connexion que vous avez choisi lors de l'inscription",
  'user.email.provide': 'Email invalide',
  'user.email.format': 'Email invalide',
  'user.password.provide': 'Mot de passe invalide',
  'Network request failed': 'Vérifiez votre connexion internet',
};

const SignIn = ({ navigation }) => {
  const setUser = useSetRecoilState(userState);
  const passwordInput = useRef();

  const [state, setState] = useState({
    error: undefined,
    loading: false,
  });

  const [username, onChangeUsername] = useState('');
  const [password, onChangePassword] = useState('');

  const signIn = async () => {
    setState({ error: undefined, loading: true });
    try {
      const { error, ...user } = await api.signIn({
        identifier: username.trim(),
        password,
      });
      if (error) {
        throw error;
      }
      setUser(user);
    } catch (error) {
      reportError(error);
      setState({ error, loading: false });
    }
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="always"
      contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <GoogleAuth />
        {Platform.OS === 'ios' && (
          <View style={styles.socialButton}>
            <AppleAuth />
          </View>
        )}
        <Text style={styles.or}>ou</Text>
        <TextInput
          style={styles.space}
          label="Pseudo"
          mode="outlined"
          textContentType="nickname"
          onChangeText={onChangeUsername}
          value={username}
          maxLength={20}
          returnKeyType="next"
          onSubmitEditing={() => passwordInput.current.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          ref={passwordInput}
          style={styles.space}
          label="Mot de passe"
          mode="outlined"
          textContentType="password"
          onChangeText={onChangePassword}
          value={password}
          secureTextEntry
          returnKeyType="done"
        />
        {state.error && (
          <HelperText type="error">
            {errors[state.error] ||
              'Erreur inconnue, nous avons été informés. Merci de réessayer plus tard'}
          </HelperText>
        )}
        <Button
          style={styles.space}
          mode="text"
          onPress={() => navigation.navigate('ResetPassword')}>
          Mot de passe oublié
        </Button>
        <Button
          style={styles.space}
          mode="contained"
          onPress={signIn}
          loading={state.loading}
          disabled={!username || !password}>
          Connexion
        </Button>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Pas encore de compte ?</Text>
        <Button
          style={styles.space}
          mode="text"
          onPress={() => navigation.replace('SignUp')}
          uppercase={false}>
          Inscription
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    display: 'flex',
    justifyContent: 'space-between',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  socialButton: {
    marginTop: 10,
  },
  or: {
    textAlign: 'center',
    marginTop: 15,
  },
  space: {
    marginTop: 15,
  },
  footer: {
    marginTop: 30,
    height: 70,
  },
  footerText: {
    textAlign: 'center',
  },
});

export default SignIn;
