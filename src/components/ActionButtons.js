import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

function ActionButtons({ onCancel, onSubmit, submitLabel, disabled }) {
  return (
    <View style={styles.actions}>
      <Button mode="outlined" style={styles.actionsButton} onPress={onCancel}>
        Annuler
      </Button>
      <Button
        mode="contained"
        style={styles.actionsButton}
        disabled={disabled}
        onPress={onSubmit}>
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  actionsButton: {
    borderRadius: 99,
    width: '40%',
  },
});

export default ActionButtons;
