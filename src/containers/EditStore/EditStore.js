import React, { useEffect } from 'react';
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
  Avatar,
  Button,
  Caption,
  IconButton,
  Paragraph,
  Text,
  TextInput,
  Title,
  TouchableRipple,
} from 'react-native-paper';

import { theme } from '../../constants';
import { useStore } from '../../store/context';
import EditSchedules from './EditSchedules';
import EditAddress from './EditAddress';
import SelectProduct from './SelectProduct';
import EditProduct from './EditProduct';
import Schedules from '../Store/Schedules';

const types = {
  draft: 'Pression',
  bottle: 'Bouteille',
};

const Product = ({ product, onPress, onRemove }) => {
  const { price, specialPrice, productName, type, volume } = product;
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
              <Text style={styles.price}>{price ? `${price}€` : '-'}</Text>
              <Text style={styles.price}>
                {specialPrice ? `${specialPrice}€` : ' '}
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
      <TouchableRipple
        style={styles.removeButton}
        rippleColor="#000"
        onPress={() => onRemove(product)}>
        <Avatar.Icon
          icon="trash-can-outline"
          size={30}
          color="#000"
          style={styles.transparentIcon}
        />
      </TouchableRipple>
    </View>
  );
};

const EditStore = ({ route, navigation }) => {
  const [state, actions] = useStore();
  const [error, setError] = React.useState(false);

  const {
    name = '',
    address,
    longitude,
    latitude,
    schedules = [],
  } = state.storeEdition;

  const validAddress = address && longitude && latitude;
  const validForm = name && validAddress;

  const save = async () => {
    // TODO: display loading info
    if (!validForm) {
      setError('Missing field');
      return;
    }
    if (state.storeEdition.id) {
      await actions.editStore(state.storeEdition.id, state.storeEdition);
      navigation.navigate('MapScreen', { contribute: true });
    } else {
      const focusStore = await actions.addStore(state.storeEdition);
      navigation.navigate('MapScreen', { contribute: true, focusStore });
    }
  };

  useEffect(() => {
    if (route.params?.store) {
      actions.setStoreEdition(route.params?.store);
    }
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          color="white"
          disabled={!validForm}
          icon="check"
          onPress={save}
        />
      ),
    });
    return navigation.addListener('beforeRemove', function () {
      // TODO: confirmation if data was edited
      actions.resetStoreEdition();
    });
  }, [route.params, validForm]);

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
            <Button onPress={() => navigation.navigate('AccountTab')}>
              Connexion
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const products =
    state.storeEdition?.products?.map(storeProduct => ({
      ...storeProduct,
      ...(storeProduct.product && {
        product: state.products.find(({ id }) => id === storeProduct.product),
      }),
    })) || [];

  const hasHH = products.some(product => product.specialPrice);

  const removeProduct = product => {
    const index = products.indexOf(product);
    actions.setStoreEdition({
      products: products.slice(0, index).concat(products.slice(index + 1)),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <ScrollView>
        <View style={styles.scrollView}>
          <View style={styles.horizontalMargin}>
            <TextInput
              style={styles.fieldName}
              label="Nom"
              mode="flat"
              textContentType="name"
              onChangeText={name => actions.setStoreEdition({ name })}
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
              {hasHH && <Text style={styles.price}>HH.</Text>}
            </View>
          )}
          {products.map((product, i) => (
            <Product
              key={i}
              product={product}
              onPress={() => navigation.navigate('EditProduct', { product })}
              onRemove={removeProduct}
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
              <Paragraph>Aucun horaire renseigné pour le moment</Paragraph>
            ) : (
              <Schedules schedules={schedules} />
            )}
            <Button
              mode="contained"
              uppercase={false}
              onPress={() => navigation.navigate('EditSchedules')}
              style={{ marginTop: 20 }}>
              Modifier les horaires
            </Button>
          </View>
        </View>
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
    marginRight: 80,
    height: 25,
  },
  productRow: {
    display: 'flex',
    flexDirection: 'row',
    borderColor: '#ddd',
    borderWidth: 0.5,
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
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    borderLeftColor: '#ddd',
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  prices: {
    display: 'flex',
    flexDirection: 'row',
  },
  price: {
    width: 40,
    textAlign: 'center',
  },
  transparentIcon: {
    backgroundColor: 'transparent',
  },
  addButton: { marginTop: 20, zIndex: 0, position: 'relative' },
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
        title: route.params?.store ? 'Modifier un bar' : 'Ajouter un bar',
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
      options={{ title: 'Ajouter un produit' }}
      name="SelectProduct"
      component={SelectProduct}
    />
    <AddStack.Screen
      options={{ title: 'Modifier un produit' }}
      name="EditProduct"
      component={EditProduct}
    />
  </AddStack.Navigator>
);
