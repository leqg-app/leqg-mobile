import React, { useCallback, useRef, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarRheostat } from 'react-native-rheostat';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { BottomSheetFooter } from '@gorhom/bottom-sheet';

import Filter from '../../../components/Filter';
import ActionSheet from '../../../components/ActionSheet';
import ActionButtons from '../../../components/ActionButtons';
import { storage } from '../../../store/storage';
import currencies from '../../../assets/currencies.json';
import { ratesState, sheetStoreState, storesState } from '../../../store/atoms';
import { priceFilterState } from '../../../store/filterAtoms';

// TODO: use only stores visible on map

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

let memoValues = [];

function getRate(currencyCode, rates) {
  if (!currencyCode || currencyCode === 'EUR') {
    return 1;
  }
  return rates.find(rate => rate.code === currencyCode)?.rate || 1;
}

function getStats(stores, rates) {
  const userCurrencyCode = storage.getString('userCurrencyCode') || 'EUR';
  const userCurrencyRate = getRate(userCurrencyCode, rates);
  const snaps = new Array(20).fill(0);
  let priceSum = 0,
    storeCount = 0;
  for (const store of stores) {
    if (!store.price) {
      continue;
    }
    const price =
      (store.price / getRate(store.currencyCode, rates)) * userCurrencyRate;
    const step = Math.min(Math.round(price * 2), 20) - 1;
    snaps[step]++;
    storeCount++;
    priceSum += price;
  }
  const average = (priceSum / storeCount).toFixed(2);
  return () => ({ snaps, average });
}

function PriceFilter() {
  const { colors } = useTheme();
  const sheet = useRef();
  const setSheetStore = useSetAtom(sheetStoreState);
  const [price, setPrice] = useAtom(priceFilterState);
  const [values, setValues] = useState([0, 20]);
  const stores = useAtomValue(storesState);
  const rates = useAtomValue(ratesState);
  const { bottom } = useSafeAreaInsets();
  const userCurrencyCode = storage.getString('userCurrencyCode') || 'EUR';
  const currencySymbol = currencies[userCurrencyCode]?.symbol || '€';

  const { snaps, average } = useMemo(getStats(stores, rates), [
    stores,
    userCurrencyCode,
  ]);

  const openModal = () => {
    setSheetStore();
    sheet.current?.snapToIndex?.(0);
  };

  const closeModal = () => {
    sheet.current?.close();
  };

  const [min, max] = values.map(i => i / 2);

  const submit = useCallback(() => {
    setPrice((min > 0 || max < 10) && [min, max]);
    closeModal();
  }, [min, max]);

  const footer = props => (
    <BottomSheetFooter {...props} bottomInset={bottom}>
      <View style={styles.footerSheet}>
        <ActionButtons
          onCancel={closeModal}
          onSubmit={submit}
          submitLabel="OK"
        />
      </View>
    </BottomSheetFooter>
  );

  return (
    <>
      <Filter
        icon="currency-usd"
        onPress={openModal}
        onRemove={price && (() => setPrice(null))}>
        {getPrice(price)}
      </Filter>
      <ActionSheet ref={sheet} onDismiss={closeModal} backdrop footer={footer}>
        <View style={styles.sheet}>
          <Text variant="titleMedium">Fourchette de prix</Text>
          <Text style={styles.rangeText}>
            {min} {currencySymbol} - {max === 10 ? 'Plus de 10' : max}{' '}
            {currencySymbol}
          </Text>
          <Text>
            Le prix moyen d&apos;une pinte de bière est de {average}{' '}
            {currencySymbol}
          </Text>
          <View style={styles.rheostatContainer}>
            <BarRheostat
              theme={{ rheostat: { themeColor: colors.primary } }}
              values={values}
              min={0}
              max={20}
              snapPoints={new Array(21).fill().map((_, i) => i)}
              snap={true}
              svgData={snaps}
              onValuesUpdated={({ values }) => {
                if (
                  memoValues[0] !== values[0] ||
                  memoValues[1] !== values[1]
                ) {
                  memoValues = values; // bc no access to updated "values" state, dkw
                  setValues(values);
                }
              }}
            />
          </View>
        </View>
      </ActionSheet>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  rangeText: {
    fontSize: 17,
    marginTop: 15,
  },
  rheostatContainer: {
    height: 270,
  },
  footerSheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'grey',
  },
});

export default PriceFilter;
