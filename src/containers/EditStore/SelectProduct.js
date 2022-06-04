import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Searchbar, TouchableRipple } from 'react-native-paper';
import { useRecoilValue } from 'recoil';

import { productsState } from '../../store/atoms';

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
  const products = useRecoilValue(productsState);
  const [search, setSearch] = useState('');

  const onSelect = productId => {
    if (productId) {
      navigation.replace('EditProduct', { productId });
    } else {
      navigation.replace('EditProduct', { productName: search });
    }
  };

  const filteredProducts = useMemo(
    () =>
      search
        ? products
            .filter(product =>
              product.name.toLowerCase().includes(search.toLowerCase()),
            )
            .sort(sortByName)
        : Array.from(products).sort(sortByName),
    [products, search],
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
            <Text style={styles.customName}>Ajouter &quot;{search}&quot;</Text>
          </View>
        </TouchableRipple>
      ) : null}
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductRow product={item} onSelect={onSelect} />
        )}
        keyExtractor={product => product.id}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        keyboardShouldPersistTaps="always"
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
