import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  VirtualizedList,
} from 'react-native';
import { Appbar, Divider } from 'react-native-paper';
import Header from './components/Header';

import { useStore } from './store/context';

const Row = ({ product }) => (
  <View style={styles.productRow}>
    <Text>{product.name}</Text>
    <Divider />
  </View>
);

const ProductFilter = ({ navigation }) => {
  const [state] = useStore();

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
          renderItem={({ item }) => <Row product={item} />}
          keyExtractor={product => product.id}
          getItemCount={products => products.length}
          getItem={(products, index) => products[index]}
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
  },
});

export default ProductFilter;
