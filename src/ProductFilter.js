import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  VirtualizedList,
} from 'react-native';
import { Appbar, TouchableRipple } from 'react-native-paper';
import Header from './components/Header';

import { useStore } from './store/context';

const Row = ({ product, onSelect }) => (
  <TouchableRipple onPress={() => onSelect(product.id)}>
    <View style={styles.productRow}>
      <Text>{product.name}</Text>
    </View>
  </TouchableRipple>
);

const ProductFilter = ({ navigation }) => {
  const [state] = useStore();

  const onSelect = productFilter => {
    navigation.navigate('MapScreen', { productFilter });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Filtrer par bière" />
      </Header>
      <View style={styles.container}>
        <VirtualizedList
          data={state.products}
          initialNumToRender={10}
          renderItem={({ item }) => <Row product={item} onSelect={onSelect} />}
          keyExtractor={product => product.id}
          getItemCount={products => products.length}
          getItem={(products, index) => ({
            name: products[index].name,
            id: products[index].id,
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
