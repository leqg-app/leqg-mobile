import React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Subheading, Title, useTheme } from 'react-native-paper';

import Auth from './Auth';
import { useStore } from '../../store/context';

const Account = () => {
  const [state] = useStore();
  return (
    <SafeAreaView>
      <View style={styles.box}>
        <Title>{state.user.username}</Title>
        <Subheading>0 contribution</Subheading>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 20,
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
