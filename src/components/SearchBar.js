import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useAtom } from 'jotai';

import leqgLogo from '../assets/icon-transparent.png';
import { sheetStoreState } from '../store/atoms';

function SearchBar({ onSearch, loading }) {
  const theme = useTheme();
  const [sheetStore, setSheetStore] = useAtom(sheetStoreState);
  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.left}>
        {sheetStore ? (
          <IconButton
            icon="arrow-left"
            onPress={() => setSheetStore()}
            color="rgba(0,0,0,0.54)"
          />
        ) : (
          <Image source={leqgLogo} style={styles.logo} />
        )}
      </View>
      <View onTouchStart={onSearch} style={styles.input}>
        <Text
          style={[styles.placeholder, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={1}>
          Rechercher un bar
        </Text>
      </View>
      {loading && <ActivityIndicator style={styles.loader} size={19} />}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 18,
    borderRadius: 30,
    height: 50,
  },
  left: {
    marginLeft: 10,
    marginRight: 11,
  },
  logo: {
    resizeMode: 'stretch',
    width: 35,
    height: 35,
    marginLeft: 12,
    marginRight: 1,
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
    // marginTop: -1,
  },
  loader: {
    marginRight: 15,
  },
});

export default SearchBar;
