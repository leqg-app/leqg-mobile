import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

function Filter({ icon, onPress, onRemove, children }) {
  return (
    <Chip
      style={styles.filter}
      textStyle={styles.text}
      icon={icon}
      onPress={onPress}
      onClose={onRemove}
      mode="outlined">
      {children}
    </Chip>
  );
}

const styles = StyleSheet.create({
  filter: {
    zIndex: 1,
    marginRight: 10,
    elevation: 2,
    backgroundColor: 'white',
    borderColor: '#666',
  },
  text: {
    color: '#666',
  },
});

export default Filter;
