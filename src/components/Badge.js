import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

function Badge({ onSelect, children, selected }) {
  const { colors } = useTheme();
  return (
    <Chip
      style={[styles.badge, selected && { backgroundColor: colors.primary }]}
      onPress={onSelect}
      textStyle={[selected && { color: colors.onPrimary }]}
      mode="outlined">
      {children}
    </Chip>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 20,
  },
});

export default Badge;
