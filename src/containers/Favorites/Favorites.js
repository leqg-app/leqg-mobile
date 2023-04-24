import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { Button, IconButton, List, Text } from 'react-native-paper';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import Title from '../../components/Title';
import { theme } from '../../constants';
import { sheetStoreState, storesState, userState } from '../../store/atoms';
import { useFavoriteState } from '../../store/hooks';

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
  const stores = useRecoilValue(storesState);
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const { removeFavorite } = useFavoriteState();

  const navigate = store => {
    const selectedStore = stores.find(({ id }) => id === store.id);
    if (!selectedStore) {
      return;
    }
    setSheetStore({ ...selectedStore, focus: true });
    navigation.navigate('MapTab', {
      screen: 'MapScreen',
    });
  };

  if (!user?.jwt || !user.favorites?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Title>Enregistrés</Title>
        {!user?.jwt ? (
          <View style={styles.center}>
            <Text variant="bodyMedium" style={styles.textCenter}>
              Veuillez vous connecter pour voir vos bars favoris
            </Text>
            <Button onPress={() => navigation.navigate('AccountTab')}>
              Connexion
            </Button>
          </View>
        ) : (
          <View style={styles.center}>
            <Text variant="bodyMedium" style={styles.textCenter}>
              Vous n&apos;avez pas encore de bar favoris.
            </Text>
            <Text variant="bodyMedium" style={styles.textCenter}>
              Explorez la carte pour en ajouter de nouveaux !
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Title>Enregistrés</Title>
      <FlatList
        data={user.favorites}
        renderItem={({ item }) => (
          <Row store={item} onPress={navigate} onRemove={removeFavorite} />
        )}
        keyExtractor={favorite => favorite.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  center: {
    flex: 1,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
});

export default Favorites;
