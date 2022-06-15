import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Paragraph, TextInput, Button, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSetRecoilState } from 'recoil';

import { userState } from '../../store/atoms';
import * as api from '../../api/users';

const errors = {
  'user.username.taken':
    "Ce nom d'utilisateur est déjà utilisé, choisissez-en un autre",
  'Network request failed': 'Vérifiez votre connexion internet',
};

function SignUpProvider({ route }) {
  const pseudoInput = useRef();
  const setUser = useSetRecoilState(userState);
  const [username, onChangeUsername] = useState('');
  const [state, setState] = useState({
    error: undefined,
    loading: false,
  });

  const { provider, auth_token } = route.params;

  const signUp = async () => {
    setState({ error: undefined, loading: true });
    try {
      const { error, ...user } = await api.signUpProvider(provider, {
        username,
        auth_token,
      });
      if (error) {
        throw error;
      }
      setUser(user);
    } catch (error) {
      setState({ error, loading: false });
    }
  };

  useEffect(() => pseudoInput?.current?.focus?.(), []);

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="always"
      contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Paragraph>
          Choisissez un pseudo pour finaliser votre inscription
        </Paragraph>
        <TextInput
          ref={pseudoInput}
          style={styles.space}
          label="Pseudo"
          mode="outlined"
          textContentType="nickname"
          returnKeyType="next"
          onChangeText={onChangeUsername}
          value={username}
          blurOnSubmit={false}
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
          disabled={!username}>
          Inscription
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  form: {
    flex: 1,
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

export default SignUpProvider;
