import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Paragraph, Title } from 'react-native-paper';
import { BarRheostat } from 'react-native-rheostat';

import ActionSheet from '../../components/ActionSheet';
import ActionButtons from '../../components/ActionButtons';
import { useStore } from '../../store/context';

// TODO: use only stores visible on map

let memoValues = [];

function PriceFilter({ visible, onClose, onPrice }) {
  const sheet = useRef();
  const [values, setValues] = useState([0, 20]);
  const [state] = useStore();

  const snaps = new Array(20).fill(0);
  let priceSum = 0;
  for (const store of state.stores) {
    const step = Math.min(Math.round(store.price * 2), 19) - 1;
    snaps[step]++;
    priceSum += store.price;
  }
  const average = priceSum / state.stores.length;

  useEffect(() => {
    if (visible) {
      sheet.current.snapToIndex(0);
    } else {
      sheet.current.close();
    }
  }, [visible]);

  const close = () => {
    sheet.current.close();
    onClose();
  };

  const [min, max] = values.map(i => i / 2);

  const submit = () => {
    sheet.current.close();
    onPrice((min > 0 || max < 10) && [min, max]);
    onClose();
  };

  return (
    <ActionSheet ref={sheet}>
      <View style={styles.sheet}>
        <Title>Fourchette de prix</Title>
        <Paragraph style={styles.rangeText}>
          {min}€ - {max === 10 ? 'Plus de 10' : max}€
        </Paragraph>
        <Paragraph>
          Le prix moyen d'une pinte de bière est de {average.toFixed(2)}€
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
    marginBottom: 5,
  },
});

export default PriceFilter;
