import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Chip, Divider, Switch, Text } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActionButtons from '../../../components/ActionButtons';
import ActionSheet from '../../../components/ActionSheet';
import ProductsList from '../../../components/ProductsList';
import Filter from '../../../components/Filter';
import { productFilterState } from '../../../store/filterAtoms';
import { productsState, sheetStoreState } from '../../../store/atoms';

function sortByName(a, b) {
  return a.name > b.name ? 1 : -1;
}

function getFilterName(filter) {
  const { products } = filter;
  if (!products?.length) {
    return 'Bière';
  }
  if (products.length === 1) {
    return products[0].name;
  }
  return `${products.length} bières`;
}

function ProductFilter() {
  const sheet = useRef();
  const searchInput = useRef();
  const products = useRecoilValue(productsState);
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const [productFilter, setProductFilter] = useRecoilState(productFilterState);
  const [search, setSearch] = useState('');
  const [filterAll, setFilterAll] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { bottom } = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(117);

  const openModal = () => {
    setSheetStore();
    sheet.current?.snapToIndex?.(0);
  };

  const closeModal = () => {
    if (searchInput.current) {
      searchInput.current.blur();
      searchInput.current.clear();
    }
    sheet.current?.close();
    setSearch('');
  };

  const reset = () => {
    setSelectedProducts([]);
    setProductFilter({ ...productFilter, products: [] });
  };

  const submit = () => {
    setProductFilter({
      products: selectedProducts,
      filterAll,
    });
    closeModal();
  };

  const unselectProduct = toRemove =>
    setSelectedProducts(
      selectedProducts.filter(product => product !== toRemove),
    );

  const toggleType = () => setFilterAll(!filterAll);

  const productsFiltered = useMemo(() => {
    if (!search) {
      return Array.from(products).sort(sortByName);
    }
    return products
      .filter(product => product.name.toLowerCase().includes(search))
      .sort(sortByName);
  }, [search]);

  const onLayoutFooter = event =>
    setFooterHeight(event.nativeEvent.layout.height);

  return (
    <>
      <Filter
        icon="beer-outline"
        onPress={openModal}
        onRemove={productFilter.products?.length && reset}>
        {getFilterName(productFilter)}
      </Filter>
      <ActionSheet ref={sheet} onDismiss={closeModal} backdrop snaps={['90%']}>
        <BottomSheetTextInput
          ref={searchInput}
          style={styles.textInput}
          placeholder="Rechercher une bière"
          onChangeText={keywords => setSearch(keywords.toLowerCase())}
          clearButtonMode="while-editing"
        />
        <Divider />
        <View style={{ flex: 1, marginBottom: footerHeight }}>
          <ProductsList
            initialSelected={selectedProducts}
            products={productsFiltered}
            onChange={setSelectedProducts}
          />
        </View>
        <View
          style={[styles.footerSheet, { paddingBottom: bottom }]}
          onLayout={onLayoutFooter}>
          {selectedProducts.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectedProductsList}>
              {selectedProducts.map(product => (
                <Chip
                  mode="outlined"
                  key={product.id}
                  style={styles.selectedProduct}
                  onPress={() => unselectProduct(product)}
                  onClose={() => unselectProduct(product)}>
                  {product.name}
                </Chip>
              ))}
            </ScrollView>
          ) : null}
          <View style={styles.filterType}>
            <Text onPress={toggleType}>
              Tous les critères doivent être présents:
            </Text>
            <Switch
              style={styles.switchFilterType}
              value={filterAll}
              onValueChange={toggleType}
            />
          </View>
          <ActionButtons
            onCancel={closeModal}
            onSubmit={submit}
            submitLabel="OK"
          />
        </View>
      </ActionSheet>
    </>
  );
}

const styles = StyleSheet.create({
  filterType: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginTop: 15,
  },
  switchFilterType: {
    marginLeft: 10,
  },
  textInput: {
    alignSelf: 'stretch',
    paddingLeft: 20,
    paddingVertical: 7,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    textAlign: 'left',
  },
  selectedProductsList: {
    paddingTop: 10,
  },
  selectedProduct: {
    marginHorizontal: 5,
    height: 33,
  },
  footerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'grey',
  },
});

export default ProductFilter;
