import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAtomValue } from 'jotai';

import StoreProducts from './StoreProducts';
import { storeState } from '../../store/atoms';

const StoreProductsScreen = () => {
  const route = useRoute();
  const { storeId } = route.params;
  const store = useAtomValue(storeState(storeId));

  return (
    <View style={styles.container}>
      {store?.products && (
        <ScrollView style={styles.content}>
          <StoreProducts products={store.products} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default StoreProductsScreen;
