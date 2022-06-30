import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Caption, Text } from 'react-native-paper';
import { useRecoilValue } from 'recoil';

import Price from '../../components/Price';
import { sortByPrices } from '../../utils/price';
import { productsState } from '../../store/atoms';

// TODO: load types from API
const types = {
  draft: 'Pression',
  bottle: 'Bouteille',
};

function groupByType(types, product) {
  if (!types[product.type]) {
    types[product.type] = {};
  }
  const id = product.productId || product.productName.trim();
  if (!types[product.type][id]) {
    types[product.type][id] = { ...product, prices: [] };
  }
  types[product.type][id].prices.push(product);
  return types;
}

function sortByType(a) {
  return a.type === 'draft' ? -1 : 1;
}

function StoreProducts(props) {
  const products = useRecoilValue(productsState);

  const hasHH = props.products.some(product => product.specialPrice);

  const productsByTypes = Array.from(props.products)
    .sort(sortByType)
    .sort(sortByPrices)
    .reduce(groupByType, {});

  return (
    <View>
      <View style={[styles.row, styles.headRow]}>
        <Text style={styles.title}>Bières</Text>
      </View>
      {Object.keys(productsByTypes).map(type => (
        <View key={type}>
          <View style={styles.row}>
            <Text style={styles.typeTitle}>{types[type] || 'Autre'}</Text>
            {hasHH && (
              <View style={styles.prices}>
                <Text style={styles.pricesCell}>Prix</Text>
                <Text style={styles.pricesCell}>HH.</Text>
              </View>
            )}
          </View>
          {Object.values(productsByTypes[type]).map((product, i) => {
            const { productName, currencyCode } = product;
            const productDetail = products.find(
              ({ id }) => id === product.productId,
            );
            return (
              <View key={i} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1}>
                    {productDetail?.name || productName || 'Bière'}
                  </Text>
                </View>
                <View>
                  {product.prices.map(({ price, volume, specialPrice }) => {
                    return (
                      <View style={styles.prices} key={volume}>
                        <Caption>{`${volume}cl`}</Caption>
                        <Text style={styles.pricesCell}>
                          {price ? (
                            <Price amount={price} currency={currencyCode} />
                          ) : (
                            '-'
                          )}
                        </Text>
                        {hasHH && (
                          <Text style={styles.pricesCell}>
                            {specialPrice ? (
                              <Price
                                amount={specialPrice}
                                currency={currencyCode}
                              />
                            ) : (
                              ' '
                            )}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      ))}
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
    minHeight: 45,
    paddingVertical: 8,
    marginLeft: 15,
    paddingRight: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headRow: {
    marginLeft: 0,
    paddingLeft: 15,
    height: 55,
  },
  typeTitle: {
    fontWeight: 'bold',
  },
  productName: {
    flex: 1,
  },
  prices: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricesCell: {
    width: 50,
    marginLeft: 10,
    textAlign: 'left',
  },
});

export default StoreProducts;
