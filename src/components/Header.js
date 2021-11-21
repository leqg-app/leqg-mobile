import React from 'react';
import { StatusBar } from 'react-native';
import { Appbar } from 'react-native-paper';

const Header = ({ children, style }) => {
  return (
    <Appbar.Header
      style={style}
      statusBarHeight={StatusBar.currentHeight || 20}>
      {children}
    </Appbar.Header>
  );
};

export default Header;
