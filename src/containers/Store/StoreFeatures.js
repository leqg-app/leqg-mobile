import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { useAtomValue } from 'jotai';

import { featuresState } from '../../store/atoms';

function StoreFeatures(props) {
  const features = useAtomValue(featuresState);

  if (!features.length) {
    return <View />;
  }

  const featuresId = props.features.map(({ id }) => id);
  return (
    <View style={styles.container}>
      {features.map(({ features }) =>
        features
          .filter(({ id }) => featuresId.includes(id))
          .map(({ id, name }) => (
            <Chip key={id} style={styles.feature}>
              {name}
            </Chip>
          )),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  feature: {
    marginRight: 10,
    marginBottom: 10,
  },
});

export default StoreFeatures;
