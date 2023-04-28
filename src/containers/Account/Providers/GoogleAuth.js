import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import { useNavigation } from '@react-navigation/native';
import { useSetRecoilState } from 'recoil';

import SocialButton from '../../../components/social/SocialButton';
import { signInProvider } from '../../../api/users';
import { userState } from '../../../store/atoms';
import { getErrorMessage } from '../../../utils/errorMessage';

const ERROR_MESSAGES = {
  'user.blocked':
    "Ce compte a été désactivé, contactez-nous pour plus d'information",
};

function GoogleAuth({ signUp }) {
  const navigation = useNavigation();
  const [state, setState] = useState({ error: undefined, loading: false });
  const setUser = useSetRecoilState(userState);

  const signUpProvider = idToken => {
    return navigation.navigate('SignUpProvider', {
      provider: 'google',
      auth_token: idToken,
    });
  };

  const connect = async () => {
    setState({ error: undefined, loading: true });
    try {
      GoogleSignin.configure({
        webClientId: Config.GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo;
      const user = await signInProvider('google', idToken);

      if (user && !user.error) {
        return setUser(user);
      }

      if (user.error !== 'user.notfound') {
        throw user.error;
      }

      if (signUp) {
        return signUpProvider(idToken);
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
            onPress: () => signUpProvider(idToken),
          },
        ],
        { cancelable: true },
      );
      setState({ error: undefined, loading: false });
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      setState({ error: getErrorMessage(err, ERROR_MESSAGES), loading: false });
    }
  };

  return (
    <>
      <SocialButton
        provider="Google"
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
  return GoogleSignin.revokeAccess();
}

export default GoogleAuth;
