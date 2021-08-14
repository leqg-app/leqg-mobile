import React, { useEffect } from 'react';
import { SafeAreaView, SectionList, StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Text,
  Searchbar,
  DataTable,
} from 'react-native-paper';

import { useStore } from './store/context';

const SelectProduct = ({ navigation }) => {
  const [state, actions] = useStore();
  const { loading, products } = state;

  useEffect(() => {
    if (!products.length) {
      actions.getProducts();
    }
  }, []);

  const data = products.reduce((products, product) => {
    const group = product.charAt(0);
    if (!products[group]) {
      products[group] = { title: group, data: [] };
    }
    products[group].data.push(product);
    return products;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Choisir une bière" />
      </Appbar.Header>
      <Searchbar placeholder="Rechercher une bière" style={styles.searchBar} />
      {loading ? (
        <ActivityIndicator animating={true} />
      ) : (
        <SectionList
          sections={data}
          renderItem={({ item }) => (
            <DataTable.Row>
              <DataTable.Cell numeric>{item}</DataTable.Cell>
            </DataTable.Row>
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          keyExtractor={(item, index) => index}
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
