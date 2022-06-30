import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';

import leqgLogo from '../assets/icon-transparent.png';

function SearchBar({ onSearch, onBack, loading }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack ? (
          <IconButton
            icon="arrow-left"
            onPress={onBack}
            color="rgba(0,0,0,0.54)"
          />
        ) : (
          <Image source={leqgLogo} style={styles.logo} />
        )}
      </View>
      <View onTouchStart={onSearch} style={styles.input}>
        <Text style={styles.placeholder} numberOfLines={1}>
          Rechercher un bar
        </Text>
      </View>
      {loading && <ActivityIndicator style={styles.loader} size={19} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
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
  left: {
    marginLeft: 10,
    marginRight: 9,
  },
  logo: {
    resizeMode: 'stretch',
    width: 35,
    height: 35,
    marginLeft: 12,
    marginRight: 1,
  },
  input: {
    paddingVertical: 10,
    flex: 1,
  },
  placeholder: {
    color: '#666',
    fontSize: 18,
    marginTop: -1,
  },
  loader: {
    marginRight: 15,
  },
});

export default SearchBar;
