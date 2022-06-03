import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { useRecoilValue } from 'recoil';

import { productsState } from '../../store/atoms';

const Row = ({ product, onSelect }) => (
  <TouchableRipple onPress={() => onSelect(product.id)}>
    <View style={styles.productRow}>
      <Text>{product.name}</Text>
    </View>
  </TouchableRipple>
);

const ITEM_HEIGHT = 50;

function sortByName(a, b) {
  return a.name > b.name ? 1 : -1;
}

const ProductFilter = ({ navigation }) => {
  const products = useRecoilValue(productsState);

  const onSelect = productFilter => {
    navigation.navigate('MapScreen', { productFilter });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={Array.from(products).sort(sortByName)}
        renderItem={({ item }) => <Row product={item} onSelect={onSelect} />}
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
  productRow: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingLeft: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
});

export default ProductFilter;
