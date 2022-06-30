import React, { useMemo, useState, useLayoutEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { List, Text } from 'react-native-paper';

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

  useLayoutEffect(() => {
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
        hideWhenScrolling: false,
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
    <FlatList
      data={currencies}
      renderItem={({ item }) => (
        <CurrencyRow currency={item} onSelect={onSelect} />
      )}
      contentInsetAdjustmentBehavior="automatic"
      keyExtractor={currency => currency.code}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
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
