import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  IconButton,
  Paragraph,
} from 'react-native-paper';

import Header from './components/Header';
import { useStore } from './store/context';

const AuthRequired = ({ navigation }) => (
  <>
    <Paragraph>Veuillez vous connecter pour voir vos bars favoris</Paragraph>
    <Button onPress={() => navigation.navigate('AccountTab')}>Connexion</Button>
  </>
);

const Row =
  actions =>
  ({ item }) =>
    (
      <Card style={styles.row}>
        <View style={styles.flex}>
          <View style={styles.info}>
            <Card.Title title={item.name} />
            <Card.Content>
              <Paragraph>{item.address}</Paragraph>
            </Card.Content>
          </View>
          <View style={styles.star}>
            <IconButton
              icon="star"
              color="green"
              onPress={() => actions.removeFavorite(item)}
            />
          </View>
        </View>
      </Card>
    );

const Favorites = ({ navigation }) => {
  const [{ user }, actions] = useStore();
  return (
    <SafeAreaView style={styles.container}>
      <Header>
        <Appbar.Content title="Enregistrés" />
      </Header>
      {user.jwt ? (
        user.favorites.length ? (
          <View style={styles.container}>
            <FlatList
              data={user.favorites}
              renderItem={Row(actions)}
              keyExtractor={favorite => favorite.id}
            />
          </View>
        ) : (
          <View style={styles.center}>
            <Paragraph>Vous n'avez pas encore de bar favoris.</Paragraph>
            <Paragraph>
              Explorez la carte pour en ajouter de nouveaux !
            </Paragraph>
          </View>
        )
      ) : (
        <View style={styles.center}>
          <AuthRequired navigation={navigation} />
        </View>
      )}
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
  row: {
    flex: 1,
    paddingBottom: 15,
    marginVertical: 7,
    marginHorizontal: 20,
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  info: {
    width: '80%',
  },
  star: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Favorites;
