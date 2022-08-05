import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Paragraph, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import Menu from '../../components/Menu';
import VersionName from '../../components/VersionName';
import Title from '../../components/Title';
import SignIn from './SignIn';
import SignUp from './SignUp';
import ResetPassword from './ResetPassword';
import SignUpProvider from './SignUpProvider';

const Anonym = ({ navigation }) => {
  return (
    <SafeAreaView>
      <Title style={{ marginBottom: 20 }}>Mon Compte</Title>
      <Menu>
        <Menu.Item
          name="Connexion"
          icon="account-check"
          onPress={() => navigation.navigate('SignIn')}
        />
        <Menu.Item
          name="Inscription"
          icon="account-plus"
          onPress={() => navigation.navigate('SignUp')}
          last
        />
      </Menu>
      <View style={styles.whySignUp}>
        <Text variant="titleMedium">Inscrivez-vous gratuitement</Text>
        <Paragraph>
          - Remerciez les contributeurs pour leur travail{'\n'}- Enregistrez vos
          bars favoris{'\n'}- Contribuez pour aider les autres utilisateurs
          {'\n'}- Gagnez en réputation et accédez à de nouvelles fonctionnalités
        </Paragraph>
      </View>
      <Menu>
        <Menu.Item
          name="Préférences"
          icon="cog-outline"
          onPress={() => navigation.navigate('SettingsStack')}
          last
        />
      </Menu>
      <VersionName />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 20,
  },
  menu: {
    borderTopColor: '#777',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  whySignUp: {
    padding: 20,
  },
});

const AnonymStack = createNativeStackNavigator();

export default () => {
  const { colors } = useTheme();
  return (
    <AnonymStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
      }}>
      <AnonymStack.Screen
        options={{ title: 'Mon compte', headerShown: false }}
        name="Anonym"
        component={Anonym}
      />
      <AnonymStack.Screen
        options={{ title: 'Connexion' }}
        name="SignIn"
        component={SignIn}
      />
      <AnonymStack.Screen
        options={{ title: 'Inscription' }}
        name="SignUp"
        component={SignUp}
      />
      <AnonymStack.Screen
        options={{ title: 'Inscription' }}
        name="SignUpProvider"
        component={SignUpProvider}
      />
      <AnonymStack.Screen
        options={{ title: 'Mot de passe oublié' }}
        name="ResetPassword"
        component={ResetPassword}
      />
    </AnonymStack.Navigator>
  );
};
