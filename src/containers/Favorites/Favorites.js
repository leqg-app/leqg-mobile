import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, IconButton, List, Paragraph } from 'react-native-paper';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { theme } from '../../constants';
import { sheetStoreState, userState } from '../../store/atoms';
import { useFavoriteState } from '../../store/hooks';

const AuthRequired = ({ navigation }) => (
  <>
    <Paragraph>Veuillez vous connecter pour voir vos bars favoris</Paragraph>
    <Button onPress={() => navigation.navigate('AccountTab')}>Connexion</Button>
  </>
);

const Row = ({ store, onPress, onRemove }) => (
  <List.Item
    title={store.name}
    description={store.address}
    onPress={() => onPress(store)}
    right={props => (
      <IconButton
        {...props}
        icon="star"
        color={theme.colors.primary}
        onPress={() => onRemove(store)}
      />
    )}
  />
);

const Favorites = ({ navigation }) => {
  const user = useRecoilValue(userState);
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const { removeFavorite } = useFavoriteState();

  const navigate = store => {
    setSheetStore({ ...store, focus: true });
    navigation.navigate('MapTab', {
      screen: 'MapScreen',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {user?.jwt ? (
        user.favorites.length ? (
          <View style={styles.container}>
            <FlatList
              data={user.favorites}
              renderItem={({ item }) => (
                <Row
                  store={item}
                  onPress={navigate}
                  onRemove={removeFavorite}
                />
              )}
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
