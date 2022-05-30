import React, { useEffect, useRef, memo } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Caption,
  Paragraph,
  Portal,
  Snackbar,
  Text,
  TextInput,
  Title,
  TouchableRipple,
} from 'react-native-paper';
import { useRecoilState } from 'recoil';

import { sortByPrices } from '../../utils/price';
import { theme } from '../../constants';
import { useStore } from '../../store/context';
import Menu from '../../components/Menu';
import Price from '../../components/Price';
import EditSchedules from './EditSchedules';
import EditAddress from './EditAddress';
import SelectProduct from './SelectProduct';
import EditProduct from './EditProduct';
import History from './History';
import Schedules from '../Store/Schedules';
import SelectCurrency from './SelectCurrency';
import StoreFeatures from '../Store/StoreFeatures';
import EditFeatures from './EditFeatures';
import { storeEditionState } from '../../store/atoms';

const types = {
  draft: 'Pression',
  bottle: 'Bouteille',
};

const Product = memo(({ product, onPress }) => {
  const { price, specialPrice, productName, type, volume, currencyCode } =
    product;
  return (
    <View style={styles.productRow}>
      <TouchableRipple
        onPress={onPress}
        rippleColor="#000"
        style={styles.productDetails}>
        <View style={styles.flex}>
          <View>
            <Text numberOfLines={1}>
              {product.product?.name || productName}
            </Text>
            <Caption>
              {types[type]}
              {volume && ` - ${volume}cl`}
            </Caption>
          </View>
          <View style={styles.flex}>
            <View style={styles.prices}>
              <Text style={styles.price}>
                {price ? <Price amount={price} currency={currencyCode} /> : '-'}
              </Text>
              <Text style={styles.price}>
                {specialPrice ? (
                  <Price amount={specialPrice} currency={currencyCode} />
                ) : (
                  ' '
                )}
              </Text>
            </View>
            <View style={styles.editButton}>
              <Avatar.Icon
                icon="pencil"
                size={30}
                color="#000"
                style={styles.transparentIcon}
              />
            </View>
          </View>
        </View>
      </TouchableRipple>
    </View>
  );
});

const EditStore = ({ route, navigation }) => {
  const [state, actions] = useStore();
  const nameInput = useRef();
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [storeEdition, setStoreEdition] = useRecoilState(storeEditionState);

  const {
    name = '',
    address,
    longitude,
    latitude,
    schedules = [],
    features = [],
  } = storeEdition;

  const validAddress = address && longitude && latitude;
  const validForm = name && validAddress && state.user.jwt;

  const save = async () => {
    setLoading(true);
    if (!validForm) {
      setError('Missing field');
      return;
    }
    let response = {};
    if (storeEdition.id) {
      response = await actions.editStore(storeEdition.id, storeEdition);
    } else {
      response = await actions.addStore(storeEdition);
    }
    setLoading(false);
    if (response.error) {
      setError(response.error);
      return;
    }
    const { store, reputation } = response;
    if (!storeEdition.id) {
      actions.setSheetStore({ ...store, focus: true });
    }
    if (reputation.total) {
      navigation.replace('WonReputation', { reputation });
    } else {
      navigation.navigate('MapScreen', { contribute: true });
    }
  };

  useEffect(() => {
    setLoading(false);
    if (route.params?.store) {
      if (!route.params.store.name && nameInput.current) {
        nameInput.current.focus();
      }
    }
    return navigation.addListener('beforeRemove', function (e) {
      // TODO: confirmation if data was edited
    });
  }, [route.params]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Appbar.Action
          color="white"
          icon="check"
          disabled={!validForm || loading}
          onPress={save}
        />
      ),
    });
  }, [validForm, loading, save]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View>
            <ActivityIndicator />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!state.user.jwt) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent={true}
          backgroundColor="transparent"
        />
        <View style={styles.center}>
          <View>
            <Paragraph>Veuillez vous connecter pour contribuer</Paragraph>
            <Button
              onPress={() => {
                actions.setSheetStore();
                navigation.navigate('AccountTab');
              }}>
              Connexion
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const products =
    storeEdition?.products
      ?.map(storeProduct => ({
        ...storeProduct,
        ...(storeProduct.productId && {
          product: state.products.find(
            ({ id }) => id === storeProduct.productId,
          ),
        }),
      }))
      .sort(sortByPrices) || [];

  const hasHH = products.some(product => product.specialPrice);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <ScrollView keyboardShouldPersistTaps="always">
        {storeEdition?.revisions?.length ? (
          <Menu>
            <Menu.Item
              name="Voir l'historique des modifications"
              icon="clock-outline"
              onPress={() =>
                navigation.navigate('History', { store: storeEdition })
              }
              last
            />
          </Menu>
        ) : null}
        <View style={styles.scrollView}>
          <View style={styles.horizontalMargin}>
            <TextInput
              ref={nameInput}
              style={styles.fieldName}
              label="Nom"
              mode="flat"
              textContentType="name"
              onChangeText={name => setStoreEdition({ ...storeEdition, name })}
              value={name}
              returnKeyType="done"
            />

            <Title style={{ marginTop: 10 }}>Adresse</Title>
            <Text>
              {validAddress
                ? address
                : 'Aucune adresse renseignée pour le moment'}
            </Text>
            <Button
              mode="contained"
              uppercase={false}
              onPress={() => navigation.navigate('EditAddress')}
              style={styles.addButton}>
              {validAddress ? 'Modifier' : 'Préciser'} l'adresse
            </Button>

            <Title style={styles.title}>Bières</Title>
          </View>

          {!products.length ? (
            <Paragraph style={styles.horizontalMargin}>
              Aucune bière renseignée pour le moment
            </Paragraph>
          ) : (
            <View style={styles.headRow}>
              <Text style={styles.price}>Prix</Text>
              <Text style={styles.price}>HH.</Text>
            </View>
          )}
          {products.map((product, i) => (
            <Product
              key={i}
              product={product}
              onPress={() => navigation.navigate('EditProduct', { product })}
            />
          ))}

          <View style={styles.horizontalMargin}>
            <Button
              mode="contained"
              uppercase={false}
              onPress={() => navigation.navigate('SelectProduct')}
              style={styles.addButton}>
              Ajouter une bière
            </Button>

            <Title style={styles.title}>Horaires</Title>
            {!schedules.length ? (
              <Paragraph style={styles.emptyText}>
                Aucun horaire renseigné pour le moment
              </Paragraph>
            ) : (
              <Pressable onPress={() => navigation.navigate('EditSchedules')}>
                <Schedules schedules={schedules} />
              </Pressable>
            )}
            <Button
              mode="contained"
              uppercase={false}
              onPress={() => navigation.navigate('EditSchedules')}>
              Modifier les horaires
            </Button>
          </View>

          <View style={styles.horizontalMargin}>
            <Title style={styles.title}>Caractéristiques</Title>
            {!features.length ? (
              <Paragraph style={styles.emptyText}>
                Aucune caractéristique pour le moment
              </Paragraph>
            ) : (
              <Pressable onPress={() => navigation.navigate('EditFeatures')}>
                <StoreFeatures features={features} />
              </Pressable>
            )}
            <Button
              mode="contained"
              uppercase={false}
              onPress={() => navigation.navigate('EditFeatures')}>
              Modifier les caractéristiques
            </Button>
          </View>
        </View>
        <Portal>
          <Snackbar
            visible={error}
            duration={3000}
            action={{
              label: 'OK',
            }}
            onDismiss={() => setError()}>
            {error}
          </Snackbar>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldName: {
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100,
  },
  horizontalMargin: {
    marginHorizontal: 20,
  },
  title: { marginTop: 30 },
  headRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginRight: 40,
    height: 25,
  },
  productRow: {
    display: 'flex',
    flexDirection: 'row',
    borderTopColor: '#ddd',
    borderTopWidth: 0.5,
  },
  productDetails: {
    flex: 1,
    paddingVertical: 7,
    paddingLeft: 20,
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prices: {
    display: 'flex',
    flexDirection: 'row',
  },
  price: {
    width: 50,
    textAlign: 'center',
  },
  editButton: {
    marginRight: 10,
  },
  transparentIcon: {
    backgroundColor: 'transparent',
  },
  addButton: { marginTop: 20, zIndex: 0, position: 'relative' },
  emptyText: {
    marginBottom: 15,
  },
});

const AddStack = createNativeStackNavigator();

export default () => (
  <AddStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: '#fff',
    }}>
    <AddStack.Screen
      options={({ route }) => ({
        title: route.params?.store?.id ? 'Modifier un bar' : 'Ajouter un bar',
      })}
      name="EditStore"
      component={EditStore}
    />
    <AddStack.Screen
      options={{ title: "Modifier l'adresse" }}
      name="EditAddress"
      component={EditAddress}
    />
    <AddStack.Screen
      options={{ title: 'Modifier les horaires' }}
      name="EditSchedules"
      component={EditSchedules}
    />
    <AddStack.Screen
      options={{ title: 'Modifier les caractéristiques' }}
      name="EditFeatures"
      component={EditFeatures}
    />
    <AddStack.Screen
      options={{ title: 'Ajouter une bière' }}
      name="SelectProduct"
      component={SelectProduct}
    />
    <AddStack.Screen
      options={{ title: 'Modifier une bière' }}
      name="EditProduct"
      component={EditProduct}
    />
    <AddStack.Screen
      options={{ title: 'Historique' }}
      name="History"
      component={History}
    />
    <AddStack.Screen
      options={{ title: 'Devise' }}
      name="SelectCurrency"
      component={SelectCurrency}
    />
  </AddStack.Navigator>
);
