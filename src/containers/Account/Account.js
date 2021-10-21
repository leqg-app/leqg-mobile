import React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Appbar, Subheading, Title } from 'react-native-paper';

import Auth from './Auth';
import Header from '../../components/Header';
import { useStore } from '../../store/context';

const Account = () => {
  const [state] = useStore();
  return (
    <SafeAreaView>
      <Header>
        <Appbar.Content title="Mon compte" />
      </Header>
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
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      {state.user.jwt ? (
        <AccountStack.Screen name="Account" component={Account} />
      ) : (
        <AccountStack.Screen name="Auth" component={Auth} />
      )}
    </AccountStack.Navigator>
  );
};
