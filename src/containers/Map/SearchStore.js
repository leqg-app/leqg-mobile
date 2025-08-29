import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { FlatList, StatusBar, StyleSheet, View } from 'react-native';
import { List, Searchbar, Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMMKVObject } from 'react-native-mmkv';
import { useAtomValue, useSetAtom } from 'jotai';

import { storage } from '../../store/storage';
import SchedulesPreview from '../Store/SchedulesPreview';
import { sheetStoreState, storesState } from '../../store/atoms';

const RowStore = memo(({ store, onSelect }) => {
  const { name, address, schedules, history } = store;
  return (
    <TouchableRipple onPress={() => onSelect(store)}>
      <View style={styles.rowStore}>
        <List.Icon icon={history ? 'clock-outline' : 'store'} />
        <View style={styles.rowInformation}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {name}
          </Text>
          {address && (
            <Text numberOfLines={1} style={styles.rowDescription}>
              {address}
            </Text>
          )}
          {schedules && <SchedulesPreview schedules={schedules} short />}
        </View>
      </View>
    </TouchableRipple>
  );
});

function SearchStore({ navigation }) {
  const stores = useAtomValue(storesState);
  const setSheetStore = useSetAtom(sheetStoreState);
  const [searchHistory = [], setSearchHistory] = useMMKVObject(
    'searchHistory',
    storage,
  );
  const searchBar = useRef();
  const [text, setText] = useState('');

  useEffect(() => {
    setSheetStore();
    setTimeout(() => {
      StatusBar.setBarStyle('dark-content');
      if (searchBar.current) {
        searchBar.current.focus();
      }
    }, 500);
  }, [searchBar.current]);

  const filterResult = useMemo(() => {
    if (!text) {
      return searchHistory;
    }
    return stores
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
    setSheetStore({ ...focusStore, focus: true });
    navigation.navigate('MapScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        ref={searchBar}
        style={styles.searchbar}
        placeholder="Rechercher un bar"
        onChangeText={text => setText(text)}
        value={text}
        icon="arrow-left"
        onIconPress={() => navigation.goBack()}
        inputStyle={styles.searchbarInput}
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        data={filterResult}
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
    color: 'white',
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 30,
    height: 50,
    paddingLeft: 10,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  searchbarInput: {
    minHeight: 50,
    paddingLeft: 5,
  },
  rowStore: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 10,
  },
  rowInformation: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomColor: '#bbb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
  },
  rowDescription: {
    color: '#777',
    marginTop: 5,
    marginBottom: 2,
  },
});

export default SearchStore;
