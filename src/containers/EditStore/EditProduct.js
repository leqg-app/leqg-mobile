import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Appbar, RadioButton, TextInput, Title } from 'react-native-paper';

import Header from '../../components/Header';
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
        product: product.product.id,
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
  const validForm = (product || productName) && type && volume && price;

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
    navigation.navigate('EditStore');
  };

  const selectedProduct = state.products.find(({ id }) => id === product);

  return (
    <SafeAreaView>
      <Header>
        <Appbar.BackAction onPress={() => navigation.navigate('EditStore')} />
        <Appbar.Content title="Ajouter une bière" />
        <Appbar.Action
          disabled={!validForm}
          icon="content-save"
          onPress={save}
        />
      </Header>
      <View style={styles.box}>
        <Title>{selectedProduct?.name || productName}</Title>
        <View style={styles.typeGroup}>
          <RadioButton.Group onValueChange={changeType} value={type}>
            {productTypes.map(({ label, value }) => (
              <RadioButton.Item
                key={value}
                color="green"
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
          value={String(price)}
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
          value={String(specialPrice)}
          keyboardType="decimal-pad"
          returnKeyType="done"
          right={<TextInput.Affix text="€" />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 20,
  },
  typeGroup: {
    marginTop: 10,
  },
  textInput: {
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
});

export default EditProducts;
