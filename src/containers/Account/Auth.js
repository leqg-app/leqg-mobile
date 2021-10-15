import React, { useRef } from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import {
  Appbar,
  Title,
  Divider,
  Paragraph,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';

import Header from '../../components/Header';
import { useStore } from '../../store/context';

const errors = {
  'Auth.form.error.email.taken':
    'Cette adresse email est déjà utilisé, essayez de vous connecter',
  'Network request failed': 'Vérifiez votre connexion internet',
};

const Auth = ({ navigation }) => {
  const [, actions] = useStore();
  const emailInput = useRef();
  const passwordInput = useRef();

  const [mode, setMode] = React.useState('signup');
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
    const error = await (mode === 'login' ? signIn : signUp)();
    if (error) {
      setState({ error, loading: false });
    }
    // Account.js will close this screen
  };

  const toggleMode = () => {
    onChangePassword('');
    setState({ error: undefined, loading: false });
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <SafeAreaView>
      <Header>
        <Appbar.Content
          title={mode === 'login' ? 'Connexion' : 'Inscription'}
        />
      </Header>
      <View style={styles.box}>
        <Paragraph>
          {mode === 'login' ? 'Pas encore inscrit ?' : 'Déjà inscrit ?'}
        </Paragraph>
        <Button
          style={styles.space}
          mode="contained"
          onPress={() => toggleMode()}>
          {mode === 'login' ? 'Inscription' : 'Connexion'}
        </Button>
        <Divider style={styles.divider} />
        <View>
          <Title>{mode === 'login' ? 'Connexion' : 'Inscription'}</Title>
          {mode === 'login' ? (
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
          <Button
            style={styles.space}
            mode="contained"
            onPress={submit}
            loading={state.loading}
            disabled={!username || !password || (mode === 'signup' && !email)}>
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 20,
  },
  divider: {
    marginVertical: 15,
  },
  space: {
    marginTop: 15,
  },
});

export default Auth;
