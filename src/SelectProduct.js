import React, { useEffect } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Searchbar,
  DataTable,
} from 'react-native-paper';

import Header from './components/Header';
import { useStore } from './store/context';

const SelectProduct = ({ navigation }) => {
  const [state, actions] = useStore();
  const { loading, products } = state;

  useEffect(() => {
    if (!products.length) {
      actions.getProducts();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Choisir une bière" />
      </Header>
      <Searchbar placeholder="Rechercher une bière" style={styles.searchBar} />
      {loading ? (
        <ActivityIndicator animating={true} />
      ) : (
        <FlatList
          data={products}
          renderItem={product => (
            <DataTable.Row>
              <DataTable.Cell>{product.name}</DataTable.Cell>
            </DataTable.Row>
          )}
          keyExtractor={product => product.id}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    borderRadius: 0,
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

export default SelectProduct;
