import React from 'react';
import {
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Appbar,
  Avatar,
  Button,
  Caption,
  Dialog,
  Paragraph,
  Portal,
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

const Product = ({ product, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.beer}>
        <View>
          <Text>{product.name}</Text>
          <Caption>{product.type}</Caption>
        </View>
        <View style={styles.prices}>
          <Text>{product.price}€</Text>
          {product.discountPrice && (
            <Text>happy hour {product.discountPrice}€</Text>
          )}
        </View>
        <View style={styles.prices}>
          <Avatar.Icon
            icon="pencil"
            size={20}
            color="#000"
            style={styles.editIcon}
          />
        </View>
      </View>
    </Pressable>
  );
};

const EditStore = ({ route, navigation }) => {
  const [state, actions] = useStore();

  console.log(state.storeEdition);

  const {
    name = '',
    address,
    longitude,
    latitude,
    products = [],
    schedules = [],
  } = state.storeEdition;

  const [error, setError] = React.useState(false);

  const validAddress = address && longitude && latitude;
  const validForm = name && validAddress;

  const save = async () => {
    if (!validForm) {
      setError('Missing field');
      return;
    }
    actions.addStore();
  };

  const goToLogin = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });

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
          style={{ marginTop: 20, zIndex: 0, position: 'relative' }}>
          {validAddress ? 'Modifier' : 'Préciser'} l'adresse
        </Button>

        <Title style={{ marginTop: 30 }}>Bières</Title>
        {!products.length && (
          <Paragraph>Aucune bière renseignée pour le moment</Paragraph>
        )}
        {products.map((product, i) => (
          <Product
            key={i}
            product={product}
            onPress={() => navigation.navigate('Products', { product })}
          />
        ))}
        <Button
          mode="contained"
          uppercase={false}
          onPress={() => navigation.navigate('SelectProduct')}
          style={{ marginTop: 20, zIndex: 0, position: 'relative' }}>
          Ajouter une bière
        </Button>

        <Title style={{ marginTop: 30 }}>Horaires</Title>
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
      {route.name === 'AddStor' && !state.jwt && (
        <Portal>
          <Dialog visible={true} onDismiss={goToLogin}>
            <Dialog.Content>
              <Paragraph>Vous devez être connecté pour ajouter</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={goToLogin}>OK</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    paddingHorizontal: 20,
  },
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
