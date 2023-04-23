import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { useRecoilState, useRecoilValue } from 'recoil';

import { LEVELS } from '../../constants';
import Menu from '../../components/Menu';
import Title from '../../components/Title';
import AnimatedCircle from '../../components/AnimatedCircle';
import VersionName from '../../components/VersionName';
import { getLevel } from '../../utils/reputation';
import { userState } from '../../store/atoms';
import Settings from './Settings';
import Anonym from './Anonym';
import Contributions from './Contributions';
import * as signOutProviders from './Providers/index.js';

const Account = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);

  const signOut = () => {
    signOutProviders[user.provider]?.signOut?.();
    setUser(null);
  };

  const askForSignOut = () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: signOut,
        },
      ],
      { cancelable: true },
    );
  };

  if (!user) {
    return <View />;
  }

  const { username, contributions } = user;
  const reputation = contributions.reduce(
    (reputation, contribution) => reputation + contribution.reputation,
    0,
  );

  const currentLevel = getLevel(reputation);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <Title>Mon Compte</Title>
        <View style={styles.head}>
          <View>
            <AnimatedCircle initial={reputation} won={0} />
          </View>
          <View style={styles.name}>
            <Text variant="titleMedium">{username}</Text>
            <Text>
              Prochain niveau: {reputation}/{LEVELS[currentLevel]}
            </Text>
          </View>
        </View>
        <View>
          <Menu>
            <Menu.Item
              name="Mes contributions"
              icon="thumb-up"
              onPress={() => navigation.navigate('Contributions')}
              value={contributions.length}
            />
            <Menu.Item
              name="Préférences"
              icon="cog-outline"
              onPress={() => navigation.navigate('SettingsStack')}
              last
            />
            <Menu.Item
              name="Se déconnecter"
              icon="logout"
              onPress={askForSignOut}
            />
          </Menu>
          <VersionName />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  head: {
    margin: 20,
    display: 'flex',
    flexDirection: 'row',
  },
  name: {
    justifyContent: 'center',
    marginHorizontal: 20,
    flex: 1,
  },
  menu: {
    borderTopColor: '#777',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

const AccountStack = createNativeStackNavigator();

export default () => {
  const user = useRecoilValue(userState);
  return (
    <AccountStack.Navigator>
      {user?.jwt ? (
        <AccountStack.Screen
          options={{ title: 'Mon compte', headerShown: false }}
          name="Account"
          component={Account}
        />
      ) : (
        <AccountStack.Screen
          options={{ headerShown: false }}
          name="AnonymStack"
          component={Anonym}
        />
      )}
      <AccountStack.Screen name="Contributions" component={Contributions} />
      <AccountStack.Screen
        options={{ headerShown: false }}
        name="SettingsStack"
        component={Settings}
      />
    </AccountStack.Navigator>
  );
};
