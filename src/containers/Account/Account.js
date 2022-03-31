import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { List, Subheading, Title, useTheme } from 'react-native-paper';

import Auth from './Auth';
import Settings from './Settings';
import { useStore } from '../../store/context';
import Menu from '../../components/Menu';

const Account = ({ navigation }) => {
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

  const contributions = state.user.contributions || 0;

  return (
    <View>
      <View style={styles.box}>
        <Title>{state.user.username}</Title>
        <Subheading>
          {contributions} contribution
          {contributions > 1 ? 's' : ''}
        </Subheading>
      </View>
      <View style={styles.menus}>
        <Menu>
          <Menu.Item
            name="Paramètres"
            icon="cog-outline"
            onPress={() => navigation.navigate('SettingsStack')}
          />
          <Menu.Item name="Se déconnecter" icon="logout" onPress={signout} />
        </Menu>
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
          options={{ headerShown: false }}
          name="AuthStack"
          component={Auth}
        />
      )}
      <AccountStack.Screen
        options={{ headerShown: false }}
        name="SettingsStack"
        component={Settings}
      />
    </AccountStack.Navigator>
  );
};
