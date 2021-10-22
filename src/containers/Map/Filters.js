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
  const [openNow, setOpenFilter] = useState(false);

  useEffect(() => {
    const filters = [];
    if (priceFilter) {
      filters.push(['<=', ['get', 'price'], priceFilter]);
    }
    if (beerFilter) {
      filters.push(['in', beerFilter, ['get', 'products']]);
    }
    if (openNow) {
      const date = new Date();
      const day = ['at', date.getDay() - 1, ['get', 's']];
      const time = date.getHours() * 3600 + date.getMinutes() * 60;
      filters.push(
        ['has', 'o', day],
        ['>', time, ['get', 'o', day]],
        ['<', time, ['get', 'c', day]],
      );
    }
    onChange(filters);
  }, [priceFilter, beerFilter, openNow]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (beerFilter !== route.params?.productFilter) {
      setBeerFilter(route.params?.productFilter);
    }
  }, [route.params?.productFilter]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <Chip
          style={styles.filter}
          icon="clock-outline"
          onPress={() => setOpenFilter(true)}
          onClose={openNow && (() => setOpenFilter(false))}
          mode="outlined">
          Ouvert
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
