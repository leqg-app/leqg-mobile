import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const Title = ({ children, style = {} }) => {
  return (
    <Text style={[styles.title, style]} variant="headlineLarge">
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 20,
    marginHorizontal: 20,
  },
});

export default Title;
