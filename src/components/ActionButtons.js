import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

function ActionButtons({ onCancel, onSubmit, submitLabel, disabled }) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button mode="outlined" style={styles.actionsButton} onPress={onCancel}>
          Annuler
        </Button>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.actionsButton}
          disabled={disabled}
          onPress={onSubmit}>
          {submitLabel}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  button: {
    borderRadius: 99,
  },
});

export default ActionButtons;
