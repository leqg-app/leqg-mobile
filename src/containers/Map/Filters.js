import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/core';

import PriceFilter from './PriceFilter';
import FeatureFilter from './FeatureFilter';
import { OPEN_STORE_EXPRESSION } from '../../utils/map';
import { useRecoilValue } from 'recoil';
import { productsState } from '../../store/atoms';

function getPrice(priceRangeFilter) {
  if (!priceRangeFilter) {
    return 'Prix';
  }
  const [min, max] = priceRangeFilter;
  if (min && max !== 10) {
    return `${min}€ - ${max}€`;
  }
  if (min) {
    return `+ de ${min}€`;
  }
  if (max < 10) {
    return `- de ${max}€`;
  }
  return 'Prix';
}

const Filters = ({ onChange }) => {
  const products = useRecoilValue(productsState);
  const navigation = useNavigation();
  const route = useRoute();
  const [priceModal, setPriceModal] = useState(false);
  const [priceRangeFilter, setPriceFilter] = useState(undefined);
  const [featureModal, setFeatureModal] = useState(false);
  const [featureFilter, setFeatureFilter] = useState(undefined);
  const [beerFilter, setBeerFilter] = useState(undefined);
  const [openNow, setOpenFilter] = useState(false);

  useEffect(() => {
    const filters = [];
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter;
      if (min > 0) {
        filters.push(['>=', CHEAPEST_PRICE_EXPRESSION, min]);
      }
      if (max < 10) {
        filters.push(['<=', CHEAPEST_PRICE_EXPRESSION, max]);
      }
    }
    if (beerFilter) {
      filters.push(['in', beerFilter, ['get', 'productsId']]);
    }
    if (openNow) {
      filters.push(OPEN_STORE_EXPRESSION);
    }
    if (featureFilter) {
      filters.push(...featureFilter.map(id => ['in', id, ['get', 'features']]));
    }
    onChange(filters);
  }, [priceRangeFilter, beerFilter, openNow, featureFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (beerFilter !== route.params?.productFilter) {
      setBeerFilter(route.params?.productFilter);
    }
  }, [route.params?.productFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ScrollView
        style={styles.scroll}
        horizontal
        showsHorizontalScrollIndicator={false}>
        <View style={styles.filters}>
          <Chip
            style={styles.filter}
            icon="currency-usd"
            onPress={() => setPriceModal(true)}
            onClose={priceRangeFilter && (() => setPriceFilter(undefined))}
            mode="outlined">
            {getPrice(priceRangeFilter)}
          </Chip>
          <Chip
            style={styles.filter}
            icon="beer-outline"
            onPress={() => navigation.navigate('ProductFilter')}
            onClose={beerFilter && (() => setBeerFilter(undefined))}
            mode="outlined">
            {beerFilter
              ? `Bière: ${products.find(p => p.id === beerFilter)?.name}`
              : 'Bière'}
          </Chip>
          <Chip
            style={styles.filter}
            icon="clock-outline"
            onPress={() => setOpenFilter(!openNow)}
            onClose={openNow && (() => setOpenFilter(false))}
            mode="outlined">
            Ouvert
          </Chip>
          <Chip
            style={styles.filter}
            onPress={() => setFeatureModal(true)}
            onClose={featureFilter && (() => setFeatureFilter(undefined))}
            mode="outlined">
            Caractéristique
          </Chip>
        </View>
      </ScrollView>
      <PriceFilter
        visible={priceModal}
        onClose={() => setPriceModal(false)}
        onPrice={priceRange => setPriceFilter(priceRange)}
      />
      <FeatureFilter
        visible={featureModal}
        features={featureFilter}
        onClose={() => setFeatureModal(false)}
        onChange={features => setFeatureFilter(features)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 60,
  },
  filters: {
    height: 33,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
    marginLeft: 20,
    marginRight: 15,
  },
  filter: {
    zIndex: 1,
    marginRight: 10,
    elevation: 4,
  },
});

export default Filters;
