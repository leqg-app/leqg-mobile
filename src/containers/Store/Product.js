import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';

import { useStore } from '../../store/context';

function Product({ product }) {
  const [state] = useStore();
  const { volume, price, specialPrice, productName } = product;
  const productDetail = state.products[product.product];
  return (
    <>
      <View style={styles.product}>
        <View style={styles.productName}>
          <Text>{productDetail?.name || productName || 'Blonde'}</Text>
        </View>
        <View style={styles.productDetails}>
          {volume && (
            <View style={styles.productCell}>
              <Text>{volume}cl</Text>
            </View>
          )}
          {price && (
            <View style={styles.productCell}>
              <Text>{price}€</Text>
            </View>
          )}
          {specialPrice && (
            <View style={styles.productCell}>
              <Text>{specialPrice}€</Text>
            </View>
          )}
        </View>
      </View>
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  product: {
    margin: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    display: 'flex',
    justifyContent: 'center',
    width: '60%',
  },
  productDetails: {
    display: 'flex',
    flexDirection: 'row',
  },
  productCell: {
    width: 40,
  },
});

export default Product;
