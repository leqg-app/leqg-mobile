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

import { useStore } from './store/context';

const Auth = ({ navigation }) => {
  const [state, actions] = useStore();
  const emailInput = useRef();
  const passwordInput = useRef();

  const [mode, setMode] = React.useState('signup');

  const [username, onChangeUsername] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');

  const signUp = async () => {
    try {
      await actions.signUp({
        username,
        email,
        password,
      });
      navigation.navigate('Map');
    } catch (e) {
      console.log(e);
    }
  };

  const signIn = async () => {
    try {
      await actions.signIn({
        identifier: username,
        password,
      });
      navigation.navigate('Map');
    } catch (e) {
      console.log(e);
    }
  };

  const toggleMode = () => {
    onChangePassword('');
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.Content
          title={mode === 'login' ? 'Connexion' : 'Inscription'}
        />
      </Appbar.Header>
      <View style={styles.box}>
        <Paragraph>
          {mode === 'login' ? 'Pas encore inscrit ?' : 'Déjà inscrit ?'}
        </Paragraph>
        <Button
          style={{ marginTop: 15 }}
          mode="contained"
          onPress={() => toggleMode()}>
          {mode === 'login' ? 'Inscription' : 'Connexion'}
        </Button>
        <Divider style={{ marginVertical: 15 }} />
        {mode === 'login' ? (
          <View>
            <Title>Connexion</Title>
            <TextInput
              style={{ marginTop: 15 }}
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
              style={{ marginTop: 15 }}
              label="Mot de passe"
              mode="outlined"
              textContentType="password"
              onChangeText={onChangePassword}
              value={password}
              secureTextEntry
              returnKeyType="done"
            />
            <HelperText type="error" visible={state.error}>
              {state.error}
            </HelperText>
            <Button
              style={{ marginTop: 15 }}
              mode="contained"
              onPress={signIn}
              loading={state.loading}>
              Connexion
            </Button>
          </View>
        ) : (
          <View>
            <Title>Inscription</Title>
            <Paragraph>
              Inscrivez-vous et profitez de tous les avantages des membres
            </Paragraph>
            <TextInput
              style={{ marginTop: 15 }}
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
              style={{ marginTop: 15 }}
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
              style={{ marginTop: 15 }}
              label="Mot de passe"
              mode="outlined"
              textContentType="password"
              returnKeyType="done"
              onChangeText={onChangePassword}
              value={password}
              secureTextEntry
            />
            <HelperText type="error" visible={state.error}>
              {state.error}
            </HelperText>
            <Button
              style={{ marginTop: 15 }}
              mode="contained"
              onPress={signUp}
              loading={state.loading}>
              Inscription
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 20,
  },
});

export default Auth;
