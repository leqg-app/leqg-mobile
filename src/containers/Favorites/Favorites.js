import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, List, Paragraph } from 'react-native-paper';

import { useStore } from '../../store/context';

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
      <List.Item
        title={item.name}
        description={item.address}
        right={props => (
          <List.Icon
            {...props}
            icon="star"
            color="green"
            onPress={() => actions.removeFavorite(item)}
          />
        )}
      />
    );

const Favorites = ({ navigation }) => {
  const [{ user }, actions] = useStore();
  return (
    <SafeAreaView style={styles.container}>
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
