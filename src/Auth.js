import React from 'react';
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

import api from './api/users';
import { useStore } from './store/context';

const Auth = ({ navigation }) => {
  const [, actions] = useStore();
  const [mode, setMode] = React.useState('signup');
  const [username, onChangeUsername] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const signUp = async () => {
    console.log('signUp');
    setLoading(true);
    setError(false);
    try {
      const response = await api.signUp({
        username,
        email,
        password,
      });
      console.log(response);
      if (response.error) {
        console.log(response.data);
        setError(response.data[0].messages[0]);
      } else {
        actions.setToken(response.jwt);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const signIn = async () => {
    console.log('signIn');
    setLoading(true);
    setError(false);
    try {
      const response = await api.signIn({
        identifier: username,
        password,
      });
      console.log(response);
      if (response.error) {
        setError(response.data[0].messages[0]);
      } else {
        actions.setToken(response.jwt);
        actions.setCurrentUser(response.user);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const toggleMode = () => {
    onChangePassword('');
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.toggleDrawer()} />
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
            />
            <TextInput
              style={{ marginTop: 15 }}
              label="Mot de passe"
              mode="outlined"
              textContentType="password"
              onChangeText={onChangePassword}
              value={password}
            />
            <HelperText type="error" visible={error}>
              {error.message}
            </HelperText>
            <Button
              style={{ marginTop: 15 }}
              mode="contained"
              onPress={signIn}
              loading={loading}>
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
              onChangeText={onChangeUsername}
              value={username}
            />
            <TextInput
              style={{ marginTop: 15 }}
              label="E-mail"
              mode="outlined"
              textContentType="emailAddress"
              onChangeText={onChangeEmail}
              value={email}
            />
            <TextInput
              style={{ marginTop: 15 }}
              label="Mot de passe"
              mode="outlined"
              textContentType="password"
              onChangeText={onChangePassword}
              value={password}
            />
            <HelperText type="error" visible={error}>
              {error.message}
            </HelperText>
            <Button
              style={{ marginTop: 15 }}
              mode="contained"
              onPress={signUp}
              loading={loading}>
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
