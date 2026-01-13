import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMMKVString } from 'react-native-mmkv';
import { Appbar } from 'react-native-paper';

import Menu from '../../components/Menu';
import SelectCurrency from '../EditStore/SelectCurrency';
import { storage } from '../../store/storage';

const Settings = ({ navigation, route }) => {
  const [currency, setCurrency] = useMMKVString('userCurrencyCode', storage);

  useEffect(() => {
    if (!currency) {
      setCurrency('EUR');
    }
    if (route.params?.currencyCode) {
      setCurrency(route.params?.currencyCode);
    }
  }, [route.params]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Appbar.BackAction onPress={navigation.goBack} />,
    });
  }, []);

  return (
    <ScrollView>
      <Menu>
        <Menu.Item
          name="Devise préférée"
          onPress={() => navigation.navigate('SelectCurrency')}
          last
          value={currency}
          arrow
        />
      </Menu>
    </ScrollView>
  );
};

const SettingsStack = createNativeStackNavigator();

export default () => {
  return (
    <SettingsStack.Navigator initialRouteName="Settings">
      <SettingsStack.Screen
        options={{ title: 'Préférences' }}
        name="Settings"
        component={Settings}
      />
      <SettingsStack.Screen
        options={{ title: 'Devise préférée' }}
        name="SelectCurrency"
        component={SelectCurrency}
      />
    </SettingsStack.Navigator>
  );
};
