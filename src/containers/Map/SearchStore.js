import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import { List, Searchbar, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMMKVObject } from 'react-native-mmkv';

import { useStore } from '../../store/context';
import { storage } from '../../store/storage';
import SchedulesPreview from '../Store/SchedulesPreview';

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
  const [state, actions] = useStore();
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
    actions.setSheetStore({ ...focusStore, focus: true });
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
        clearButtonMode="always"
        icon="arrow-left"
        onIconPress={() => navigation.goBack()}
        inputStyle={styles.searchbarInput}
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
  searchbarInput: {
    paddingLeft: 9,
  },
  rowStore: {
    display: 'flex',
    flexDirection: 'row',
  },
  rowInformation: {
    paddingVertical: 10,
    paddingRight: 10,
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
