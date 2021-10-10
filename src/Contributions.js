import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Paragraph } from 'react-native-paper';

import Header from './components/Header';

const Contributions = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header>
        <Appbar.Content title="Contributions" />
      </Header>
      <View style={styles.center}>
        <Paragraph>
          Veuillez vous connecter pour voir vos contributions
        </Paragraph>
        <Button onPress={() => navigation.navigate('AccountTab')}>
          Connexion
        </Button>
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

export default Contributions;
