import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';

const Item = ({ name, onPress = () => {}, last, icon }) => (
  <List.Item
    style={[styles.menu, last && styles.last]}
    title={name}
    onPress={onPress}
    left={props => icon && <List.Icon {...props} icon={icon} />}
  />
);

const Menu = ({ children }) => {
  return <View>{children}</View>;
};

const styles = StyleSheet.create({
  menu: {
    borderTopColor: '#777',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  last: {
    borderTopWidth: 0,
    borderBottomColor: '#777',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

Menu.Item = Item;

export default Menu;
