import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import PriceFilter from './PriceFilter';
import FeatureFilter from './FeatureFilter';
import ProductFilter from './ProductFilter';
import ScheduleFilter from './ScheduleFilter';

const Filters = () => {
  return (
    <ScrollView
      style={styles.scroll}
      horizontal
      showsHorizontalScrollIndicator={false}>
      <View style={styles.filters}>
        <PriceFilter />
        <ProductFilter />
        <ScheduleFilter />
        <FeatureFilter />
      </View>
    </ScrollView>
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
});

export default Filters;
