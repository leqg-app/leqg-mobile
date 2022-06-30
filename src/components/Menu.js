import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';

const Item = ({ name, onPress = () => {}, last, icon, value, arrow }) => (
  <List.Item
    style={[styles.menu, last && styles.last]}
    title={name}
    onPress={onPress}
    left={props => icon && <List.Icon {...props} icon={icon} />}
    {...((value || arrow) && {
      right: props => (
        <>
          {value && <Text style={styles.rightValue}>{value}</Text>}
          {arrow && <List.Icon {...props} icon="chevron-right" />}
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
    borderBottomColor: '#777',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rightValue: {
    marginTop: 5,
    backgroundColor: '#DDD',
    paddingTop: 6,
    height: 30,
    marginRight: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  arrow: {
    margin: 0,
  },
});

Menu.Item = Item;

export default Menu;
