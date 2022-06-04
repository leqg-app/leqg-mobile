import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  IconButton,
  RadioButton,
  TextInput,
  Title,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useRecoilState, useRecoilValue } from 'recoil';

import { theme } from '../../constants';
import countries from '../../assets/countries.json';
import currencies from '../../assets/currencies.json';
import { displayPrice, parsePrice } from '../../utils/price';
import { productsState, storeEditionState } from '../../store/atoms';

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
  const products = useRecoilValue(productsState);
  const [storeEdition, setStoreEdition] = useRecoilState(storeEditionState);
  const { colors } = useTheme();
  const [storeProduct, setProduct] = useState({
    product: null,
    type: 'draft',
    volume: 50,
    price: '',
    specialPrice: '',
    currencyCode: countries[storeEdition.countryCode || 'FR'],
  });

  useEffect(() => {
    if (!route.params) {
      // WTF?
      return;
    }
    const { product, productId, productName } = route.params;
    if (product) {
      // Editing product
      setProduct({
        ...storeProduct,
        ...product,
        price: displayPrice(product.price),
        specialPrice: displayPrice(product.specialPrice),
        productId: product.product?.id || null,
      });
      return;
    }
    if (productId) {
      // New product with id
      setProduct({
        ...storeProduct,
        productId,
      });
      return;
    }
    if (productName) {
      // New product with name
      setProduct({
        ...storeProduct,
        productId: null,
        productName,
      });
      return;
    }
    if (route.params.currencyCode) {
      setProduct({
        ...storeProduct,
        currencyCode: route.params.currencyCode,
      });
    }
    // WTF?
  }, [route.params]);

  const changeType = type => {
    setProduct({
      ...storeProduct,
      type,
      volume: type === 'draft' ? 50 : 33,
    });
  };

  const {
    productId,
    productName,
    type,
    volume,
    price,
    specialPrice,
    currencyCode,
  } = storeProduct;
  const validForm = Boolean(
    (productId || productName) && type && volume && parseFloat(price),
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
  }, [navigation, storeProduct]);

  const save = () => {
    if (!validForm) {
      return;
    }

    // Replace beer if this one was already added on this store
    const products = (storeEdition?.products || []).filter(
      ({ id, tmpId }) =>
        (!storeProduct.id || storeProduct.id !== id) &&
        (!storeProduct.tmpId || storeProduct.tmpId !== tmpId),
    );

    // Format price
    storeProduct.price = parsePrice(storeProduct.price);
    storeProduct.specialPrice = parsePrice(storeProduct.specialPrice);
    storeProduct.tmpId = Math.random().toString(36);

    products.push(storeProduct);

    setStoreEdition({ ...storeEdition, products });
    navigation.goBack();
  };

  const selectedProduct = products.find(({ id }) => id === productId);

  const removeProduct = () => {
    Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer ce produit ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          const storeProducts = storeEdition?.products || [];
          const products = storeProducts.filter(storeProduct =>
            storeProduct.product?.id
              ? storeProduct.product !== productId
              : storeProduct.productName !== productName,
          );
          setStoreEdition({ ...storeEdition, products });
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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
      <View style={styles.flexPrice}>
        <TextInput
          autoFocus={!!(route.params?.productId || route.params?.productName)}
          style={styles.textInput}
          label="Prix"
          mode="flat"
          onChangeText={price => setProduct({ ...storeProduct, price })}
          value={price ? String(price) : null}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        <TouchableRipple
          onPress={() => navigation.navigate('SelectCurrency')}
          borderless
          style={styles.selectCurrency}>
          <Text>{currencies[currencyCode].symbol}</Text>
        </TouchableRipple>
      </View>
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
        right={<TextInput.Affix text={currencies[currencyCode].symbol} />}
      />
      {(storeProduct.id || storeProduct.tmpId) && (
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
  flexPrice: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  selectCurrency: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 9,
    width: 50,
    height: 50,
    marginLeft: 20,
  },
  removeButton: {
    marginTop: 10,
  },
});

export default EditProducts;
