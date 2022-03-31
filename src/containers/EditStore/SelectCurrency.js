import React, { useMemo, useState, useEffect } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text } from 'react-native';
import { List } from 'react-native-paper';

import currencies from '../../assets/currencies.json';

const currenciesArray = Object.entries(currencies).map(([code, details]) => ({
  ...details,
  code,
}));

const ITEM_HEIGHT = 50;

const CurrencyRow = ({ currency, onSelect }) => (
  <List.Item
    title={currency.name}
    style={styles.currencyRow}
    onPress={() => onSelect(currency.code)}
    left={props => (
      <Text {...props} style={styles.currencyName}>
        {currency.symbol}
      </Text>
    )}
  />
);

const SelectCurrency = ({ navigation }) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize: 'none',
        inputType: 'text',
        autoFocus: true,
        placeholder: 'Chercher une devise',
        textColor: '#fff',
        headerIconColor: '#fff',
        hintTextColor: '#ccc',
        shouldShowHintSearchIcon: false,
        onChangeText: event => setSearch(event.nativeEvent.text),
      },
    });
  }, [navigation]);

  const onSelect = currencyCode => {
    if (!currencyCode) {
      return;
    }
    const { index, routes } = navigation.getState();
    const previousScreenName = routes[index - 1]?.name;
    if (previousScreenName) {
      navigation.navigate(previousScreenName, { currencyCode });
    } else {
      navigation.goBack();
    }
  };

  const currencies = useMemo(
    () =>
      currenciesArray
        ? currenciesArray.filter(
            currency =>
              currency.name.toLowerCase().includes(search.toLowerCase()) ||
              currency.code.toLowerCase().includes(search.toLowerCase()),
          )
        : currenciesArray,
    [search],
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={currencies}
        renderItem={({ item }) => (
          <CurrencyRow currency={item} onSelect={onSelect} />
        )}
        keyExtractor={currency => currency.code}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    borderRadius: 0,
  },
  currencyRow: {
    height: ITEM_HEIGHT,
  },
  currencyName: {
    fontSize: 17,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default SelectCurrency;
