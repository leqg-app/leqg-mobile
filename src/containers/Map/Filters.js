import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/core';

import { useStore } from '../../store/context';
import PriceFilter from './PriceFilter';

const Filters = ({ onChange }) => {
  const [state] = useStore();
  const navigation = useNavigation();
  const route = useRoute();
  const [priceModal, setPriceModal] = useState(false);
  const [priceFilter, setPriceFilter] = useState(undefined);
  const [beerFilter, setBeerFilter] = useState(undefined);

  useEffect(() => {
    const filters = [];
    if (priceFilter) {
      filters.push(['<=', ['get', 'price'], priceFilter]);
    }
    if (beerFilter) {
      filters.push(['in', beerFilter, ['get', 'products']]);
    }
    onChange(filters);
  }, [priceFilter, beerFilter]);

  useEffect(() => {
    if (beerFilter !== route.params?.productFilter) {
      setBeerFilter(route.params?.productFilter);
    }
  }, [route.params?.productFilter]);

  return (
    <>
      <View style={styles.filters}>
        <Chip
          style={styles.filter}
          icon="currency-usd"
          onPress={() => setPriceModal(true)}
          onClose={priceFilter && (() => setPriceFilter(undefined))}
          mode="outlined">
          {priceFilter ? `Prix: ${priceFilter}€` : 'Prix'}
        </Chip>
        <Chip
          style={styles.filter}
          icon="beer-outline"
          onPress={() => navigation.navigate('ProductFilter')}
          onClose={beerFilter && (() => setBeerFilter(undefined))}
          mode="outlined">
          {beerFilter
            ? `Bière: ${state.products.find(p => p.id === beerFilter)?.name}`
            : 'Bière'}
        </Chip>
      </View>
      {priceModal && (
        <PriceFilter
          onClose={() => setPriceModal(false)}
          onPrice={price => setPriceFilter(price)}
          initialPrice={priceFilter}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  filters: {
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
    marginLeft: 25,
  },
  filter: {
    zIndex: 1,
    marginRight: 10,
  },
});

export default Filters;
