import React from 'react';
import { StatusBar } from 'react-native';
import { Appbar } from 'react-native-paper';

const Header = ({ children, style, barStyle = 'light-content' }) => {
  return (
    <Appbar.Header
      style={style}
      statusBarHeight={StatusBar.currentHeight || 20}>
      <StatusBar barStyle={barStyle} />
      {children}
    </Appbar.Header>
  );
};

export default Header;
