import React from 'react';
import { FlatList, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { List } from 'react-native-paper';
import { useAtomValue } from 'jotai';

import Title from '../../components/Title';
import { productsState } from '../../store/atoms';

const ITEM_HEIGHT = 50;

const Product = ({ product }) => (
  <List.Item style={styles.productRow} title={product.name} />
);

function Products() {
  const products = useAtomValue(productsState);
  const productsList = Array.from(products).sort((a, b) =>
    a.name > b.name ? 1 : -1,
  );

  return (
    <SafeAreaView style={styles.container}>
      <Title>Bières</Title>
      <FlatList
        data={productsList}
        renderItem={({ item }) => <Product product={item} />}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        keyExtractor={product => product.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  productRow: {
    height: ITEM_HEIGHT,
    paddingLeft: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default Products;
