import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Caption } from 'react-native-paper';

import { useStore } from '../../store/context';

const types = {
  draft: 'Pression',
  bottle: 'Bouteille',
};

function StoreProducts({ products }) {
  const [state] = useStore();
  const hasHH = products.some(product => product.specialPrice);
  // TODO: bold happy hour if we currently are
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.title}>Bières</Text>
        <View style={styles.prices}>
          <Text style={styles.pricesCell}>Prix</Text>
          {hasHH && <Text style={styles.pricesCell}>HH.</Text>}
        </View>
      </View>
      {products.map((product, i) => {
        const { volume, price, specialPrice, productName } = product;
        const productDetail = state.products[product.product];
        return (
          <View key={i} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1}>
                {productDetail?.name || productName || 'Blonde'}
              </Text>
              <Caption>
                {types[product.type]}
                {volume && ` - ${volume}cl`}
              </Caption>
            </View>
            <View style={styles.prices}>
              <Text style={styles.pricesCell}>{price ? `${price}€` : '-'}</Text>
              {specialPrice && (
                <Text style={styles.pricesCell}>{specialPrice}€</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    height: 55,
    paddingTop: 3,
    paddingLeft: 15,
    paddingRight: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  productName: {
    flex: 1,
  },
  prices: {
    display: 'flex',
    flexDirection: 'row',
  },
  pricesCell: {
    width: 50,
    textAlign: 'center',
  },
});

export default StoreProducts;
