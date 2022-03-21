import React from 'react';
import { StyleSheet, Text } from 'react-native';

import currencies from '../assets/currencies.json';
import { displayPrice } from '../utils/price';

function Price({ amount, currency }) {
  const { symbol } = currencies[currency];
  return (
    <>
      <Text>{displayPrice(amount)} </Text>
      <Text style={styles[`currency${symbol.length}`]}>{symbol}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  currency1: {},
  currency2: {
    fontSize: 12,
  },
  currency3: {
    fontSize: 10,
  },
});

export default Price;
