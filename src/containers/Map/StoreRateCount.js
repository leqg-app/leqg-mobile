import React from 'react';
import { StyleSheet } from 'react-native';
import { useRecoilValue } from 'recoil';
import { Text } from 'react-native-paper';

import { storeState } from '../../store/atoms';

const StoreRateCount = ({ id }) => {
  const store = useRecoilValue(storeState(id));

  return <Text style={styles.text}>({store.rateCount})</Text>;
};

const styles = StyleSheet.create({
  text: {
    color: 'grey',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default StoreRateCount;
