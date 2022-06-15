import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import AppleIcon from './AppleIcon';
import GoogleIcon from './GoogleIcon';

const SocialButton = ({ provider, onPress }) => {
  const { Icon, style } = providers[provider];
  return (
    <TouchableRipple borderless onPress={onPress} style={styles.touch}>
      <View style={[styles.button, style.button]}>
        <Icon />
        <Text style={[styles.text, style.text]}>Continuer avec {provider}</Text>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  touch: {
    borderRadius: 13,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    padding: 13,
    borderRadius: 13,
  },
  text: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  appleButton: {
    backgroundColor: '#000',
    borderColor: '#ddd',
  },
  appleText: {
    color: '#fff',
  },
  googleButton: {
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
  },
  googleText: {
    color: '#000',
  },
});

const providers = {
  Apple: {
    Icon: AppleIcon,
    style: {
      button: styles.appleButton,
      text: styles.appleText,
    },
  },
  Google: {
    Icon: GoogleIcon,
    style: {
      button: styles.googleButton,
      text: styles.googleText,
    },
  },
};

export default SocialButton;
