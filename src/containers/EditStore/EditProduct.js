import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  IconButton,
  RadioButton,
  TextInput,
  Title,
  useTheme,
} from 'react-native-paper';
import { theme } from '../../constants';

import { useStore } from '../../store/context';

const productTypes = [
  {
    label: 'Pression',
    value: 'draft',
  },
  {
    label: 'Bouteille',
    value: 'bottle',
  },
];

const EditProducts = ({ navigation, route }) => {
  const [state, actions] = useStore();
  const { colors } = useTheme();
  const [storeProduct, setProduct] = useState({
    product: {},
    type: 'draft',
    volume: 50,
    price: '',
    specialPrice: '',
  });

  useEffect(() => {
    if (!route.params) {
      // WTF?
      return;
    }
    const { product, productId, productName } = route.params;
    if (product) {
      setProduct({
        ...storeProduct,
        ...product,
        ...(product.product?.id && { product: product.product.id }),
      });
      return;
    }
    if (productId) {
      const found = state.products.find(product => product.id === productId);
      if (found) {
        setProduct({
          ...storeProduct,
          product: found.id,
        });
      }
      return;
    }
    if (productName) {
      setProduct({
        ...storeProduct,
        productName,
      });
      return;
    }
    // WTF?
  }, [route.params]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeType = type => {
    setProduct({
      ...storeProduct,
      type,
      volume: type === 'draft' ? 50 : 33,
    });
  };

  const { product, productName, type, volume, price, specialPrice } =
    storeProduct;
  const validForm = Boolean(
    (product || productName) && type && volume && price,
  );

  useLayoutEffect(() => {
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
  }, [navigation, validForm]);

  const save = () => {
    if (!validForm) {
      return;
    }

    // Replace beer if this one was already added on this store
    const storeProducts = state.storeEdition?.products || [];
    const products = storeProducts.filter(
      storeProduct => storeProduct.product !== product,
    );

    products.push(storeProduct);
    actions.setStoreEdition({
      products,
    });
    navigation.goBack();
  };

  const selectedProduct = state.products.find(({ id }) => id === product);

  const removeProduct = () => {
    Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer ce produit ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          const storeProducts = state.storeEdition?.products || [];
          const products = storeProducts.filter(storeProduct =>
            storeProduct.product
              ? storeProduct.product !== product
              : storeProduct.productName !== productName,
          );
          actions.setStoreEdition({
            products,
          });
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Title>{selectedProduct?.name || productName}</Title>
      <View style={styles.typeGroup}>
        <RadioButton.Group onValueChange={changeType} value={type}>
          {productTypes.map(({ label, value }) => (
            <RadioButton.Item
              key={value}
              color={colors.primary}
              label={label}
              value={value}
            />
          ))}
        </RadioButton.Group>
      </View>
      <TextInput
        style={styles.textInput}
        label="Volume"
        mode="flat"
        onChangeText={volume => setProduct({ ...storeProduct, volume })}
        value={String(volume)}
        keyboardType="numeric"
        returnKeyType="done"
        right={<TextInput.Affix text="cl" />}
      />
      <TextInput
        style={styles.textInput}
        label="Prix"
        mode="flat"
        onChangeText={price => setProduct({ ...storeProduct, price })}
        value={price ? String(price) : null}
        keyboardType="decimal-pad"
        returnKeyType="done"
        right={<TextInput.Affix text="€" />}
      />
      <TextInput
        style={styles.textInput}
        label="Prix en Happy hour"
        mode="flat"
        onChangeText={specialPrice =>
          setProduct({ ...storeProduct, specialPrice })
        }
        value={specialPrice ? String(specialPrice) : null}
        keyboardType="decimal-pad"
        returnKeyType="done"
        right={<TextInput.Affix text="€" />}
      />
      {storeProduct.id && (
        <Button
          mode="contained"
          color={theme.colors.danger}
          style={styles.removeButton}
          onPress={removeProduct}>
          Supprimer
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  typeGroup: {
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  removeButton: {
    marginTop: 10,
  },
});

export default EditProducts;
