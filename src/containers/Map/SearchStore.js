import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FlatList, StatusBar, StyleSheet } from 'react-native';
import { List, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMMKVObject } from 'react-native-mmkv';

import { useStore } from '../../store/context';
import { storage } from '../../store/storage';

function RowStore({ store, onSelect }) {
  return (
    <List.Item
      onPress={() => onSelect(store)}
      title={store.name}
      left={props => (
        <List.Icon
          {...props}
          icon={store.history ? 'clock-outline' : 'store'}
        />
      )}
      style={styles.rowStore}
    />
  );
}

function SearchStore({ navigation }) {
  const [state] = useStore();
  const [searchHistory = [], setSearchHistory] = useMMKVObject(
    'searchHistory',
    storage,
  );
  const searchBar = useRef();
  const [text, setText] = useState('');

  useEffect(() => {
    setTimeout(() => {
      StatusBar.setBarStyle('dark-content');
      if (searchBar.current) {
        searchBar.current.focus();
      }
    }, 500);
  }, [searchBar.current]);

  const stores = useMemo(() => {
    if (!text) {
      return searchHistory;
    }
    return state.stores
      .filter(s => s.name.toLowerCase().includes(text.toLowerCase()))
      .slice(0, 5);
  }, [text]);

  const selectStore = focusStore => {
    // Search history: only store 5 last stores
    const history = searchHistory
      .filter(store => store.id !== focusStore.id)
      .slice(0, 4);
    history.unshift({ ...focusStore, history: true });
    setSearchHistory(history);
    navigation.navigate('MapScreen', { focusStore });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        ref={searchBar}
        style={styles.searchbar}
        placeholder="Rechercher un bar"
        onChangeText={text => setText(text)}
        value={text}
        clearButtonMode="always"
        icon="arrow-left"
        onIconPress={() => navigation.goBack()}
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        data={stores}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RowStore onSelect={selectStore} store={item} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    elevation: 0,
    color: 'white',
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 30,
    height: 45,
    paddingLeft: 10,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  rowStore: {
    borderBottomColor: '#bbb',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default SearchStore;
