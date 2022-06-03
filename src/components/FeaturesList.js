import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Title } from 'react-native-paper';
import { useRecoilValue } from 'recoil';

import Badge from './Badge';
import { featuresState } from '../store/atoms';

const FeaturesList = ({ initialSelected = [], onChange }) => {
  const features = useRecoilValue(featuresState);
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

  return features.map(({ name, features }) => (
    <View key={name}>
      <Title style={styles.title}>{name}</Title>
      <View style={styles.featureList}>
        {features.map(feature => (
          <Badge
            key={feature.id}
            selected={selected.some(({ id }) => feature.id === id)}
            onSelect={() => onSelect(feature.id)}>
            {feature.name}
          </Badge>
        ))}
      </View>
    </View>
  ));
};

const styles = StyleSheet.create({
  title: {
    marginVertical: 10,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default FeaturesList;
