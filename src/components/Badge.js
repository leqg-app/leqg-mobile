import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { theme } from '../constants';

const Badge = ({ children, onSelect, selected }) => {
  return (
    <Text
      style={[styles.badge, selected && styles.selected]}
      onPress={onSelect}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 20,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
  },
});

export default memo(Badge);
