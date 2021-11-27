import React, { useState, useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { List, Searchbar } from 'react-native-paper';

import { useStore } from '../../store/context';

function RowStore({ store, onSelect }) {
  return (
    <List.Item
      onPress={() => onSelect(store)}
      title={store.name}
      left={props => <List.Icon {...props} icon="store" />}
    />
  );
}

function SearchStore({ navigation }) {
  const [state] = useStore();
  const searchBar = useRef();
  const [text, setText] = useState('');

  useEffect(() => {
    if (searchBar.current) {
      searchBar.current.focus();
    }
  }, [searchBar.current]);

  const stores = text
    ? state.stores
        .filter(s => s.name.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 5)
    : [];

  return (
    <View style={styles.container}>
      <Searchbar
        ref={searchBar}
        style={styles.searchbar}
        placeholder="Rechercher"
        onChangeText={text => setText(text)}
        value={text}
        clearButtonMode="always"
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        data={stores}
        renderItem={({ item }) => (
          <RowStore
            onSelect={focusStore =>
              navigation.navigate('MapScreen', { focusStore })
            }
            store={item}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    zIndex: 1,
    elevation: 0,
    color: 'white',
    marginTop: 40,
    marginHorizontal: 20,
    borderRadius: 30,
    height: 45,
    paddingLeft: 10,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default SearchStore;
