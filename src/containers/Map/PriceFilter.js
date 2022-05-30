import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { Paragraph, Title } from 'react-native-paper';
import { BarRheostat } from 'react-native-rheostat';

import ActionSheet from '../../components/ActionSheet';
import ActionButtons from '../../components/ActionButtons';
import { useStore } from '../../store/context';
import { storage } from '../../store/storage';
import currencies from '../../assets/currencies.json';

// TODO: use only stores visible on map

let memoValues = [];

function getRate(currencyCode, rates) {
  if (!currencyCode || currencyCode === 'EUR') {
    return 1;
  }
  return rates.find(rate => rate.code === currencyCode)?.rate || 1;
}

function getStats({ stores, rates }) {
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

function PriceFilter({ visible, onClose, onPrice }) {
  const sheet = useRef();
  const [values, setValues] = useState([0, 20]);
  const [state, actions] = useStore();

  const userCurrencyCode = storage.getString('userCurrencyCode') || 'EUR';
  const currencySymbol = currencies[userCurrencyCode]?.symbol || '€';

  const { snaps, average } = useMemo(getStats(state), [
    state.stores,
    userCurrencyCode,
  ]);

  useEffect(() => {
    if (visible) {
      actions.setSheetStore();
      sheet.current.snapToIndex(0);
    } else {
      sheet.current?.close();
    }
  }, [visible]);

  const close = useCallback(() => {
    sheet.current.close();
    onClose();
  }, []);

  const [min, max] = values.map(i => i / 2);

  const submit = useCallback(() => {
    sheet.current.close();
    onPrice((min > 0 || max < 10) && [min, max]);
    onClose();
  }, [min, max]);

  return (
    <ActionSheet ref={sheet} onDismiss={close} backdrop>
      <View style={styles.sheet}>
        <Title>Fourchette de prix</Title>
        <Paragraph style={styles.rangeText}>
          {min}
          {currencySymbol} - {max === 10 ? 'Plus de 10' : max}
          {currencySymbol}
        </Paragraph>
        <Paragraph>
          Le prix moyen d'une pinte de bière est de {average}
          {currencySymbol}
        </Paragraph>
        <BarRheostat
          theme={{ rheostat: { themeColor: '#163033' } }}
          values={values}
          min={0}
          max={20}
          snapPoints={new Array(21).fill(0).map((_, i) => i)}
          snap={true}
          svgData={snaps}
          onValuesUpdated={({ values }) => {
            if (memoValues[0] !== values[0] || memoValues[1] !== values[1]) {
              memoValues = values; // bc no access to updated "values" state, dkw
              setValues(values);
            }
          }}
        />
        <View style={styles.actionButtons}>
          <ActionButtons onCancel={close} onSubmit={submit} submitLabel="OK" />
        </View>
      </View>
    </ActionSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 20,
  },
  rangeText: {
    fontSize: 17,
    marginTop: 15,
  },
  actionButtons: {
    marginTop: 15,
    // marginBottom: 5,
  },
});

export default PriceFilter;
