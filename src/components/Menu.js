import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { List } from 'react-native-paper';

const Item = ({ name, onPress = () => {}, last, icon, value }) => (
  <List.Item
    style={[styles.menu, last && styles.last]}
    title={name}
    onPress={onPress}
    left={props => icon && <List.Icon {...props} icon={icon} />}
    {...(value && {
      right: props => (
        <>
          <Text style={styles.rightValue}>{value}</Text>
          <List.Icon {...props} icon="chevron-right" />
        </>
      ),
    })}
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
  rightValue: {
    marginVertical: 10,
  },
});

Menu.Item = Item;

export default Menu;
