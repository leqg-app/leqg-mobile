import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { Appbar, Button, DataTable, Paragraph } from 'react-native-paper';

import Header from './components/Header';
import { useStore } from './store/context';

const AuthRequired = ({ navigation }) => (
  <>
    <Paragraph>Veuillez vous connecter pour voir vos bars favoris</Paragraph>
    <Button onPress={() => navigation.navigate('AccountTab')}>Connexion</Button>
  </>
);

const Favorites = ({ navigation }) => {
  const [{ user }] = useStore();
  return (
    <SafeAreaView style={styles.container}>
      <Header>
        <Appbar.Content title="Enregistrés" />
      </Header>
      <View style={styles.center}>
        {user.jwt ? (
          user.details.favorites.length ? (
            <FlatList
              data={user.details.favorites}
              renderItem={favorite => (
                <DataTable.Row>
                  <DataTable.Cell>{favorite.id}</DataTable.Cell>
                </DataTable.Row>
              )}
              keyExtractor={favorite => favorite.id}
            />
          ) : (
            <>
              <Paragraph>Vous n'avez pas encore de bar favoris.</Paragraph>
              <Paragraph>
                Explorez la carte pour en ajouter de nouveaux !
              </Paragraph>
            </>
          )
        ) : (
          <AuthRequired navigation={navigation} />
        )}
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
