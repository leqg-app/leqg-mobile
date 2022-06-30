import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { IconButton, Text, TouchableRipple } from 'react-native-paper';

const ITEM_HEIGHT = 50;

const ProductsList = ({ initialSelected = [], products, onChange }) => {
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => setSelected(initialSelected), [initialSelected]);
  useEffect(() => onChange(selected), [selected]);

  const onSelect = item => {
    if (selected.some(product => product === item)) {
      setSelected(selected.filter(product => product !== item));
    } else {
      setSelected(selected.concat(item));
    }
  };

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableRipple onPress={() => onSelect(item)}>
        <View style={styles.productRow}>
          <Text>{item.name}</Text>
          {selected.includes(item) ? <IconButton icon="check" /> : null}
        </View>
      </TouchableRipple>
    ),
    [selected],
  );

  return (
    <BottomSheetFlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={product => product.id}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="always"
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
    paddingLeft: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ProductsList;
