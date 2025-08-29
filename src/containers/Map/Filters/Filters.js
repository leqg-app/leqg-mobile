import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useAtom } from 'jotai';

import PriceFilter from './PriceFilter';
import FeatureFilter from './FeatureFilter';
import ProductFilter from './ProductFilter';
import Filter from '../../../components/Filter';
import { scheduleFilterState } from '../../../store/filterAtoms';

const Filters = () => {
  const [scheduleFilter, setScheduleFilter] = useAtom(scheduleFilterState);

  return (
    <ScrollView
      style={styles.scroll}
      horizontal
      showsHorizontalScrollIndicator={false}>
      <View style={styles.filters}>
        <PriceFilter />
        <ProductFilter />
        <Filter
          icon="clock-outline"
          onPress={() => setScheduleFilter(true)}
          onRemove={scheduleFilter && (() => setScheduleFilter(false))}>
          Ouvert
        </Filter>
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
