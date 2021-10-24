import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Searchbar, TouchableRipple } from 'react-native-paper';

import { useStore } from '../../store/context';

const ProductRow = ({ product, onSelect }) => (
  <TouchableRipple onPress={() => onSelect(product.id)}>
    <View style={styles.productRow}>
      <Text>{product.name}</Text>
    </View>
  </TouchableRipple>
);
const ITEM_HEIGHT = 59.64;

function sortByName(a, b) {
  return a.name > b.name ? 1 : -1;
}

const SelectProduct = ({ navigation }) => {
  const [state] = useStore();
  const [search, setSearch] = useState('');

  const onSelect = productId => {
    if (productId) {
      navigation.navigate('EditProduct', { productId });
    } else {
      navigation.navigate('EditProduct', { productName: search });
    }
  };

  const products = useMemo(
    () =>
      search
        ? state.products
            .filter(product =>
              product.name.toLowerCase().includes(search.toLowerCase()),
            )
            .sort(sortByName)
        : Array.from(state.products).sort(sortByName),
    [state.products],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        placeholder="Nommer ou rechercher une bière"
        style={styles.searchBar}
        onChangeText={setSearch}
      />
      {search ? (
        <TouchableRipple onPress={() => onSelect()}>
          <View style={styles.productRow}>
            <Text style={styles.customName}>Ajouter "{search}"</Text>
          </View>
        </TouchableRipple>
      ) : null}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductRow product={item} onSelect={onSelect} />
        )}
        keyExtractor={product => product.id}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
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
  productRow: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  customName: {
    fontWeight: 'bold',
  },
});

export default SelectProduct;
