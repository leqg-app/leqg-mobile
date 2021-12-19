import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { List, Subheading, Title, useTheme } from 'react-native-paper';

import Auth from './Auth';
import { useStore } from '../../store/context';

const Menu = ({ name, icon, onPress }) => (
  <List.Item
    style={styles.menu}
    title={name}
    onPress={onPress}
    left={props => <List.Icon {...props} icon={icon} />}
  />
);

const Account = () => {
  const [state, actions] = useStore();

  const signout = () => {
    Alert.alert('Confirmation', 'Voulez-vous vraiment vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => actions.signOut(),
      },
    ]);
  };

  return (
    <View>
      <View style={styles.box}>
        <Title>{state.user.username}</Title>
        <Subheading>0 contribution</Subheading>
      </View>
      <View style={styles.menus}>
        <Menu name="Se déconnecter" icon="logout" onPress={signout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 20,
  },
  menus: {
    marginTop: 30,
  },
  menu: {
    borderTopColor: '#777',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

const AccountStack = createNativeStackNavigator();

export default () => {
  const [state] = useStore();
  const { colors } = useTheme();
  return (
    <AccountStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
      }}>
      {state.user.jwt ? (
        <AccountStack.Screen
          options={{ title: 'Mon compte' }}
          name="Account"
          component={Account}
        />
      ) : (
        <AccountStack.Screen
          options={{ title: 'Inscription' }}
          name="Auth"
          component={Auth}
        />
      )}
    </AccountStack.Navigator>
  );
};
