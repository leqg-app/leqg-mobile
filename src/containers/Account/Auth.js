import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  Title,
  Divider,
  Paragraph,
  TextInput,
  Button,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ResetPassword from './ResetPassword';
import { useStore } from '../../store/context';

const errors = {
  'Auth.form.error.email.taken':
    'Cette adresse email est déjà utilisée, essayez de vous connecter',
  'Auth.form.error.username.taken':
    "Ce nom d'utilisateur est déjà utilisé, choisissez-en un autre",
  'Auth.form.error.invalid': 'Identifiant ou mot de passe incorrect',
  'Auth.form.error.confirmed': 'Confirmez votre email afin de vous connecter',
  'Auth.form.error.blocked':
    "Ce compte a été désactivé, contactez-nous pour plus d'information",
  'Auth.form.error.password.local':
    "Ce compte n'a pas de mot de passe, utilisez le moyen de connexion que vous avez choisi lors de l'inscription",
  'Auth.form.error.email.provide': 'Email invalide',
  'Auth.form.error.email.format': 'Email invalide',
  'Auth.form.error.password.provide': 'Mot de passe invalide',
  'Auth.form.error.password.format':
    'Votre mot de pass ne peut pas contenir plus de 3 fois le symbole "$"', // WTF Strapi?
  'Network request failed': 'Vérifiez votre connexion internet',
};

const Auth = ({ navigation }) => {
  const [, actions] = useStore();
  const emailInput = useRef();
  const passwordInput = useRef();

  const [mode, setMode] = React.useState('signIn');
  const [state, setState] = React.useState({
    error: undefined,
    loading: false,
  });

  const [username, onChangeUsername] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');

  const signUp = () =>
    actions.signUp({
      username,
      email,
      password,
    });
  const signIn = () =>
    actions.signIn({
      identifier: username,
      password,
    });

  const submit = async () => {
    setState({ error: undefined, loading: true });
    const error = await (mode === 'signIn' ? signIn : signUp)();
    if (error) {
      setState({ error, loading: false });
    }
    // Account.js will close this screen
  };

  const toggleMode = () => {
    onChangePassword('');
    setState({ error: undefined, loading: false });
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    navigation.setOptions({
      title: mode === 'signIn' ? 'Inscription' : 'Connexion',
    });
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="always">
      <Paragraph>
        {mode === 'signIn' ? 'Pas encore inscrit ?' : 'Déjà inscrit ?'}
      </Paragraph>
      <Button
        style={styles.space}
        mode="contained"
        onPress={() => toggleMode()}>
        {mode === 'signIn' ? 'Inscription' : 'Connexion'}
      </Button>
      <Divider style={styles.divider} />

      <Title>{mode === 'signIn' ? 'Connexion' : 'Inscription'}</Title>
      {mode === 'signIn' ? (
        <>
          <TextInput
            style={styles.space}
            label="Pseudo"
            mode="outlined"
            textContentType="nickname"
            onChangeText={onChangeUsername}
            value={username}
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
        </>
      ) : (
        <>
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
        </>
      )}
      {state.error && (
        <HelperText type="error">
          {errors[state.error] ||
            'Erreur inconnue, nous avons été informés. Merci de réessayer plus tard'}
        </HelperText>
      )}
      {mode === 'signIn' ? (
        <Button
          style={styles.space}
          mode="text"
          onPress={() => navigation.navigate('ResetPassword')}>
          Mot de passe oublié
        </Button>
      ) : null}
      <Button
        style={styles.space}
        mode="contained"
        onPress={submit}
        loading={state.loading}
        disabled={!username || !password || (mode === 'signUp' && !email)}>
        {mode === 'signIn' ? 'Connexion' : 'Inscription'}
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

const AuthStack = createNativeStackNavigator();

export default () => {
  const { colors } = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
      }}>
      <AuthStack.Screen
        options={{ title: 'Connexion' }}
        name="Auth"
        component={Auth}
      />
      <AuthStack.Screen
        options={{ title: 'Mot de passe oublié' }}
        name="ResetPassword"
        component={ResetPassword}
      />
    </AuthStack.Navigator>
  );
};
