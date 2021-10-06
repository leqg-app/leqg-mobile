import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Paragraph } from 'react-native-paper';

import Header from './components/Header';

const Contributions = ({ navigation }) => {
  return (
    <SafeAreaView>
      <Header>
        <Appbar.Content title="Contributions" />
      </Header>
      <View style={styles.center}>
        <Paragraph>
          Veuillez vous connecter pour voir vos contributions
        </Paragraph>
        <Button onPress={() => navigation.navigate('Auth')}>Connexion</Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: {
    height: '70%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Contributions;
