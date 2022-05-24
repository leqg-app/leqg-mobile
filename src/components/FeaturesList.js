import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Title } from 'react-native-paper';

import { useStore } from '../store/context';
import Badge from './Badge';

const FeaturesList = ({ initialSelected, onChange }) => {
  const [state] = useStore();
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => setSelected(initialSelected), [initialSelected]);
  useEffect(() => onChange(selected), [selected]);

  const onSelect = id => {
    if (selected.includes(id)) {
      setSelected(selected.filter(selectedId => selectedId !== id));
    } else {
      setSelected(selected.concat(id));
    }
  };

  return state.features.map(({ name, features }) => (
    <View key={name}>
      <Title style={styles.title}>{name}</Title>
      <View style={styles.featureList}>
        {features.map(feature => (
          <Badge
            key={feature.id}
            selected={selected.includes(feature.id)}
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
