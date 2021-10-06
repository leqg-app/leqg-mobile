import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Paragraph } from 'react-native-paper';

import Header from './components/Header';

const Favorites = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header>
        <Appbar.Content title="Enregistrés" />
      </Header>
      <View style={styles.center}>
        <Paragraph>
          Veuillez vous connecter pour voir vos bars favoris
        </Paragraph>
        <Button onPress={() => navigation.navigate('Auth')}>Connexion</Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Favorites;
