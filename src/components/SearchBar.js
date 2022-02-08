import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import leqgLogo from '../assets/icon-transparent.png';

function SearchBar({ onSearch }) {
  return (
    <View style={styles.container} onTouchStart={onSearch}>
      <Image source={leqgLogo} style={styles.logo} />
      <Text style={styles.placeholder} numberOfLines={1}>
        Rechercher un bar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 30,
    height: 45,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    width: 35,
    height: 35,
    resizeMode: 'stretch',
    marginLeft: 18,
    marginRight: 13,
  },
  placeholder: {
    color: '#666',
    fontSize: 18,
    marginTop: -1,
  },
});

export default SearchBar;
