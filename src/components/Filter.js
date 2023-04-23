import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

function Filter({ icon, onPress, onRemove, children }) {
  return (
    <Chip
      style={styles.filter}
      icon={icon}
      onPress={onPress}
      onClose={onRemove}
      mode="outlined"
      elevated>
      {children}
    </Chip>
  );
}

const styles = StyleSheet.create({
  filter: {
    zIndex: 1,
    marginRight: 10,
    elevation: 3,
    borderRadius: 20,
    borderWidth: 0,
  },
});

export default Filter;
