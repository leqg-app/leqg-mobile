import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import GoogleIcon from './GoogleIcon';

const SocialButton = ({ onPress }) => (
  <TouchableRipple borderless onPress={onPress} style={styles.button}>
    <View style={styles.flex}>
      <GoogleIcon />
      <Text style={styles.text}>Continuer avec Google</Text>
    </View>
  </TouchableRipple>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 13,
  },
  flex: {
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 2,
    padding: 13,
    borderRadius: 13,
  },
  text: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SocialButton;
