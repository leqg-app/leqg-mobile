import React, { useEffect, useRef, memo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Caption,
  Card,
  Paragraph,
  Portal,
  Snackbar,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';

import { sortByPrices } from '../../utils/price';
import Menu from '../../components/Menu';
import Price from '../../components/Price';
import EditSchedules, { newSchedule } from './EditSchedules';
import EditAddress from './EditAddress';
import SelectProduct from './SelectProduct';
import EditProduct from './EditProduct';
import History from './History';
import Schedules from '../Store/Schedules';
import SelectCurrency from './SelectCurrency';
import StoreFeatures from '../Store/StoreFeatures';
import EditFeatures from './EditFeatures';
import {
  productsState,
  sheetStoreState,
  storeEditionState,
  userState,
} from '../../store/atoms';
import { useStoreActions } from '../../store/storeActions';
import { getErrorMessage } from '../../utils/errorMessage';

const types = {
  draft: 'Pression',
  bottle: 'Bouteille',
};

const Product = memo(({ product, onPress, hasHH }) => {
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
              {hasHH && (
                <Text style={styles.price}>
                  {specialPrice ? (
                    <Price amount={specialPrice} currency={currencyCode} />
                  ) : (
                    ' '
                  )}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableRipple>
    </View>
  );
});

const EditStore = ({ route, navigation }) => {
  const products = useRecoilValue(productsState);
  const nameInput = useRef();
  const [state, setState] = useState({ error: false, loading: false });
  const user = useRecoilValue(userState);
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const [storeEdition, setStoreEdition] = useRecoilState(storeEditionState);
  const { saveStore } = useStoreActions();

  const {
    name = '',
    address,
    longitude,
    latitude,
    schedules = new Array(7).fill(0).map(newSchedule),
    features = [],
  } = storeEdition;

  const validAddress = address && longitude && latitude;
  const validForm =
    name && validAddress && storeEdition.products?.length && user;

  const save = async () => {
    setState({ loading: true });
    if (!validForm) {
      return setState({ error: 'Certains champs sont manquants' });
    }
    const { error, store, reputation } = await saveStore(storeEdition);
    if (error) {
      return setState({ error: getErrorMessage(error) });
    }
    if (!storeEdition.id) {
      setSheetStore({ ...store, focus: true });
    }
    if (reputation.total) {
      navigation.replace('WonReputation', { reputation });
    } else {
      navigation.navigate('MapScreen', { contribute: true });
    }
  };

  useEffect(() => {
    setState({ loading: false });
    if (route.params?.store && !route.params.store.name && nameInput.current) {
      nameInput.current.focus();
    }
    return navigation.addListener('beforeRemove', function () {
      // TODO: confirmation if data was edited
    });
  }, [route.params]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Appbar.BackAction onPress={navigation.goBack} />,
      headerRight: () => (
        <Appbar.Action
          icon="check"
          disabled={!validForm || state.loading}
          onPress={save}
        />
      ),
    });
  }, [validForm, state.loading, save]);

  if (state.loading) {
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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View>
            <Paragraph>Veuillez vous connecter pour contribuer</Paragraph>
            <Button
              onPress={() => {
                setSheetStore();
                navigation.navigate('AccountTab');
              }}>
              Connexion
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const storeProducts =
    storeEdition?.products
      ?.map(storeProduct => ({
        ...storeProduct,
        ...(storeProduct.productId && {
          product: products.find(({ id }) => id === storeProduct.productId),
        }),
      }))
      .sort(sortByPrices) || [];

  const hasHH =
    storeProducts.some(({ specialPrice }) => specialPrice) ||
    schedules.some(
      schedule => schedule.openingSpecial || schedule.closingSpecial,
    );

  return (
    <SafeAreaView style={styles.container}>
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
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                ref={nameInput}
                style={styles.fieldName}
                label="Nom"
                mode="flat"
                textContentType="name"
                onChangeText={name =>
                  setStoreEdition({ ...storeEdition, name })
                }
                value={name}
                returnKeyType="done"
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title titleStyle={styles.title} title="Adresse">
              Adresse
            </Card.Title>
            <Card.Content>
              <Text>
                {validAddress
                  ? address
                  : 'Aucune adresse renseignée pour le moment'}
              </Text>
              <Button
                mode="outlined"
                uppercase={false}
                onPress={() => navigation.navigate('EditAddress')}
                style={styles.addButton}>
                {validAddress ? 'Modifier' : 'Préciser'} l&apos;adresse
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title titleStyle={styles.title} title="Bières" />
            <Card.Content>
              {!storeProducts.length ? (
                <Paragraph style={styles.horizontalMargin}>
                  Aucune bière renseignée pour le moment
                </Paragraph>
              ) : (
                <View style={styles.headRow}>
                  <Text style={styles.price}>Prix</Text>
                  {hasHH && <Text style={styles.price}>HH.</Text>}
                </View>
              )}
              {storeProducts.map((product, i) => (
                <Product
                  key={i}
                  product={product}
                  onPress={() =>
                    navigation.navigate('EditProduct', { product })
                  }
                  hasHH={hasHH}
                />
              ))}
              <Button
                mode="outlined"
                uppercase={false}
                onPress={() => navigation.navigate('SelectProduct')}
                style={styles.addButton}>
                Ajouter une bière
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title titleStyle={styles.title} title="Horaires" />
            <Card.Content>
              {!schedules.length ? (
                <Paragraph style={styles.emptyText}>
                  Aucun horaire renseigné pour le moment
                </Paragraph>
              ) : (
                <Pressable
                  style={styles.schedules}
                  onPress={() => navigation.navigate('EditSchedules')}>
                  <Schedules schedules={schedules} />
                </Pressable>
              )}
              <Button
                mode="outlined"
                uppercase={false}
                onPress={() => navigation.navigate('EditSchedules')}>
                Modifier les horaires
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title titleStyle={styles.title} title="Caractéristiques" />
            <Card.Content>
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
                mode="outlined"
                uppercase={false}
                onPress={() => navigation.navigate('EditFeatures')}>
                Modifier les caractéristiques
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title titleStyle={styles.title} title="Autres informations" />
            <Card.Content>
              <TextInput
                style={styles.fieldName}
                label="Téléphone"
                mode="flat"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                onChangeText={phone =>
                  setStoreEdition({ ...storeEdition, phone })
                }
                value={storeEdition.phone}
                returnKeyType="done"
              />
              <TextInput
                style={styles.fieldName}
                label="Site internet"
                mode="flat"
                keyboardType="url"
                textContentType="URL"
                onChangeText={website =>
                  setStoreEdition({ ...storeEdition, website })
                }
                value={storeEdition.website}
                returnKeyType="done"
              />
            </Card.Content>
          </Card>
        </View>
        <Portal>
          <Snackbar
            visible={state.error}
            duration={3000}
            action={{
              label: 'OK',
            }}
            onDismiss={() => setState({ error: false })}>
            {state.error}
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
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100,
  },
  card: {
    marginTop: 10,
    marginHorizontal: 8,
  },
  title: { fontSize: 18 },
  headRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
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
  schedules: {
    marginBottom: 10,
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
  <AddStack.Navigator>
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
