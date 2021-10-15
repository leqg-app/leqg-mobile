import React, { useMemo } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Appbar, TouchableRipple } from 'react-native-paper';

import Header from '../../components/Header';
import { useStore } from '../../store/context';

const Row = ({ product, onSelect }) => (
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

const ProductFilter = ({ navigation }) => {
  const [state] = useStore();

  const onSelect = productFilter => {
    navigation.navigate('MapScreen', { productFilter });
  };

  const products = useMemo(
    () => state.products.sort(sortByName),
    [state.products],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Filtrer par bière" />
      </Header>
      <View style={styles.container}>
        <FlatList
          data={products}
          renderItem={({ item }) => <Row product={item} onSelect={onSelect} />}
          keyExtractor={product => product.id}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productRow: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
});

export default ProductFilter;
