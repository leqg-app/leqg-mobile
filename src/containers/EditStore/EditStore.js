import React, { useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Appbar,
  Avatar,
  Button,
  Caption,
  Paragraph,
  Text,
  TextInput,
  Title,
} from 'react-native-paper';

import { useStore } from '../../store/context';
import Header from '../../components/Header';
import EditSchedules from './EditSchedules';
import EditAddress from './EditAddress';
import SelectProduct from './SelectProduct';
import EditProduct from './EditProduct';

const daysShort = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
const types = {
  draft: 'Pression',
  bottle: 'Bouteille',
};

const Product = ({ product, onPress, onRemove }) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.beer}>
        <View>
          <Text>{product.product?.name || product.productName}</Text>
          <Caption>{types[product.type]}</Caption>
        </View>
        <View style={styles.prices}>
          <Text>{product.price}€</Text>
          {product.specialPrice && <Text>hh: {product.specialPrice}€</Text>}
        </View>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <View style={styles.prices}>
            <Avatar.Icon
              icon="pencil"
              size={30}
              color="#000"
              style={styles.editIcon}
            />
          </View>
          <View style={styles.prices}>
            <Avatar.Icon
              icon="close"
              size={30}
              color="#000"
              style={styles.editIcon}
              onPress={onRemove}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const EditStore = ({ navigation }) => {
  const [state, actions] = useStore();
  const [error, setError] = React.useState(false);

  const {
    name = '',
    address,
    longitude,
    latitude,
    schedules = [],
  } = state.storeEdition;

  const products =
    state.storeEdition?.products?.map(storeProduct => ({
      ...storeProduct,
      ...(storeProduct.product && {
        product: state.products.find(({ id }) => id === storeProduct.product),
      }),
    })) || [];

  const validAddress = address && longitude && latitude;
  const validForm = name && validAddress;

  const save = async () => {
    if (!validForm) {
      setError('Missing field');
      return;
    }
    actions.addStore();
  };

  if (!state.user.jwt) {
    return (
      <SafeAreaView style={styles.container}>
        <Header>
          <Appbar.Content title="Ajouter un bar" />
        </Header>
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

  return (
    <SafeAreaView>
      <Header>
        <Appbar.Content title="Ajouter un bar" />
        <Appbar.Action
          disabled={!validForm || state.loading}
          icon="send"
          onPress={save}
        />
      </Header>
      <ScrollView style={styles.box}>
        <TextInput
          style={{
            marginTop: 10,
            marginBottom: 15,
            backgroundColor: 'transparent',
          }}
          label="Nom"
          mode="flat"
          textContentType="name"
          onChangeText={name => actions.setStoreEdition({ name })}
          value={name}
          returnKeyType="done"
        />

        <Title style={{ marginTop: 10 }}>Adresse</Title>
        <Text>
          {validAddress ? address : 'Aucune adresse renseignée pour le moment'}
        </Text>
        <Button
          mode="contained"
          uppercase={false}
          onPress={() => navigation.navigate('EditAddress')}
          style={styles.addButton}>
          {validAddress ? 'Modifier' : 'Préciser'} l'adresse
        </Button>

        <Title style={styles.title}>Bières</Title>
        {!products.length && (
          <Paragraph>Aucune bière renseignée pour le moment</Paragraph>
        )}
        {products.map((product, i) => (
          <Product
            key={i}
            product={product}
            onPress={() => navigation.navigate('EditProduct', { product })}
            onRemove={console.log}
          />
        ))}
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
          <Text>
            Ouvert le{' '}
            {schedules
              .filter(({ closed }) => !closed)
              .map((_, i) => daysShort[i])
              .join(', ')}
          </Text>
        )}
        <Button
          mode="contained"
          uppercase={false}
          onPress={() => navigation.navigate('EditSchedules')}
          style={{ marginTop: 20 }}>
          Modifier les horaires
        </Button>
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
  box: {
    paddingHorizontal: 20,
  },
  title: { marginTop: 30 },
  beer: {
    paddingVertical: 10,
    borderBottomColor: '#999',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prices: {
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  editIcon: {
    backgroundColor: 'transparent',
  },
  addButton: { marginTop: 20, zIndex: 0, position: 'relative' },
});

const AddStack = createNativeStackNavigator();

export default () => (
  <AddStack.Navigator screenOptions={{ headerShown: false }}>
    <AddStack.Screen name="EditStore" component={EditStore} />
    <AddStack.Screen name="EditAddress" component={EditAddress} />
    <AddStack.Screen name="EditSchedules" component={EditSchedules} />
    <AddStack.Screen name="SelectProduct" component={SelectProduct} />
    <AddStack.Screen name="EditProduct" component={EditProduct} />
  </AddStack.Navigator>
);
