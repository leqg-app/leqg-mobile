import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import { productsState } from '../store/atoms';
import { TouchableRipple } from 'react-native-paper';

const ITEM_HEIGHT = 50;

function sortByName(a, b) {
  return a.name > b.name ? 1 : -1;
}

const ProductsList = ({ initialSelected = [], onChange }) => {
  const products = useRecoilValue(productsState);
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => setSelected(initialSelected), [initialSelected]);
  useEffect(() => onChange(selected), [selected]);

  const onSelect = id => {
    if (selected.some(feature => feature.id === id)) {
      setSelected(selected.filter(feature => feature.id !== id));
    } else {
      setSelected(selected.concat({ id }));
    }
  };

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableRipple onPress={() => onSelect(item.id)}>
        <View style={styles.productRow}>
          <Text>{item.name}</Text>
        </View>
      </TouchableRipple>
    ),
    [],
  );

  return (
    <BottomSheetFlatList
      data={Array.from(products).sort(sortByName)}
      renderItem={renderItem}
      keyExtractor={product => product.id}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  title: {
    marginVertical: 10,
  },
  contentContainer: {
    backgroundColor: 'white',
  },
  productRow: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingLeft: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
});

export default ProductsList;
