import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSetRecoilState } from 'recoil';
import { appleAuth } from '@invertase/react-native-apple-authentication';

import SocialButton from '../../../components/social/SocialButton';
import { signInProvider } from '../../../api/users';
import { userState } from '../../../store/atoms';
import { getErrorMessage } from '../../../utils/errorMessage';

const ERROR_MESSAGES = {
  'user.blocked':
    "Ce compte a été désactivé, contactez-nous pour plus d'information",
};

function AppleAuth({ signUp }) {
  const navigation = useNavigation();
  const [state, setState] = useState({ error: undefined, loading: false });
  const setUser = useSetRecoilState(userState);

  const signUpProvider = idToken => {
    return navigation.navigate('SignUpProvider', {
      provider: 'apple',
      auth_token: idToken,
    });
  };

  const connect = async () => {
    setState({ error: undefined, loading: true });
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL],
      });

      const { identityToken } = appleAuthRequestResponse;

      const user = await signInProvider('apple', identityToken);

      if (user && !user.error) {
        return setUser(user);
      }

      if (user.error !== 'user.notfound') {
        throw user.error;
      }

      if (signUp) {
        return signUpProvider(identityToken);
      }

      Alert.alert(
        '',
        "Aucun compte n'existe avec ce service, voulez-vous en créer un nouveau ?",
        [
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: signOut,
          },
          {
            text: 'OK',
            onPress: () => signUpProvider(identityToken),
          },
        ],
        { cancelable: true },
      );

      setState({ error: undefined, loading: false });
    } catch (err) {
      const { CANCELED, UNKNOWN } = appleAuth.Error;
      if (err.code === CANCELED || err.code === UNKNOWN) {
        return;
      }
      setState({ error: getErrorMessage(err, ERROR_MESSAGES), loading: false });
    }
  };

  return (
    <>
      <SocialButton
        provider="Apple"
        onPress={connect}
        loading={state.loading}
      />
      <Portal>
        <Snackbar
          visible={state.error}
          duration={3000}
          action={{
            label: 'OK',
          }}
          onDismiss={() => setState({ error: undefined, loading: false })}>
          {state.error}
        </Snackbar>
      </Portal>
    </>
  );
}

export function signOut() {
  // TODO
}

export default AppleAuth;
