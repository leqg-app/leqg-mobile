import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  IconButton,
  Menu,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useAtom, useAtomValue } from 'jotai';

import { theme } from '../../constants';
import countries from '../../assets/countries.json';
import currencies from '../../assets/currencies.json';
import { displayPrice, parsePrice } from '../../utils/price';
import { productsState, storeEditionState } from '../../store/atoms';

const EditProducts = ({ navigation, route }) => {
  const products = useAtomValue(productsState);
  const [storeEdition, setStoreEdition] = useAtom(storeEditionState);
  const { colors } = useTheme();
  const [productData, setProductData] = useState({
    productId: null,
    productName: '',
    currencyCode: countries[storeEdition.countryCode || 'FR'],
    variants: [],
  });
  const [openTypeMenu, setOpenTypeMenu] = useState(null);

  useEffect(() => {
    if (!route.params) {
      return;
    }
    const { product, productId, productName } = route.params;

    if (product) {
      // Editing product - group all variants of same product
      const sameProductVariants = (storeEdition?.products || []).filter(p => {
        if (product.productId) {
          return p.productId === product.productId;
        }
        return p.productName?.trim() === product.productName?.trim();
      });

      setProductData({
        productId: product.product?.id || product.productId || null,
        productName: product.productName || '',
        currencyCode:
          product.currencyCode || countries[storeEdition.countryCode || 'FR'],
        variants: sameProductVariants.map(v => ({
          id: v.id,
          tmpId: v.tmpId,
          type: v.type,
          volume: v.volume,
          price: displayPrice(v.price),
          specialPrice: displayPrice(v.specialPrice),
        })),
      });
      return;
    }

    if (productId) {
      // New product with id
      setProductData({
        ...productData,
        productId,
        variants: [{ type: 'draft', volume: 50, price: '', specialPrice: '' }],
      });
      return;
    }

    if (productName) {
      // New product with name
      setProductData({
        ...productData,
        productId: null,
        productName: productName.trim(),
        variants: [{ type: 'draft', volume: 50, price: '', specialPrice: '' }],
      });
      return;
    }

    if (route.params.currencyCode) {
      setProductData({
        ...productData,
        currencyCode: route.params.currencyCode,
      });
    }
  }, [route.params]);

  const updateVariant = (index, field, value) => {
    const newVariants = [...productData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };

    // Auto-adjust volume when type changes
    if (field === 'type') {
      newVariants[index].volume = value === 'draft' ? 50 : 33;
    }

    setProductData({ ...productData, variants: newVariants });
  };

  const addVariant = () => {
    const lastVariant = productData.variants[productData.variants.length - 1];
    let volume = lastVariant.volume,
      price = lastVariant.price;
    if (lastVariant.type === 'draft') {
      if (volume === 50) {
        volume = 25;
        price = parseFloat(price) * 0.5;
        price = Math.ceil(price * 10) / 10;
      } else if (volume === 25) {
        volume = 50;
        price = parseFloat(price) * 2;
        price = Math.floor(price * 10) / 10;
      }
    }

    setProductData({
      ...productData,
      variants: [
        ...productData.variants,
        { type: 'draft', volume, price, specialPrice: '' },
      ],
    });
  };

  const removeVariant = index => {
    if (productData.variants.length === 1) {
      Alert.alert('Erreur', 'Vous devez conserver au moins un variant.');
      return;
    }

    Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer ce variant ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => {
          const newVariants = productData.variants.filter(
            (_, i) => i !== index,
          );
          setProductData({ ...productData, variants: newVariants });
        },
      },
    ]);
  };

  const validForm = Boolean(
    (productData.productId || productData.productName) &&
    productData.variants.length > 0 &&
    productData.variants.every(v => v.type && v.volume && parseFloat(v.price)),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton disabled={!validForm} icon="check" onPress={save} />
      ),
    });
  }, [navigation, productData, validForm]);

  const save = () => {
    if (!validForm) {
      return;
    }

    // Remove all existing variants of this product
    let remainingProducts = (storeEdition?.products || []).filter(p => {
      if (productData.productId) {
        return p.productId !== productData.productId;
      }
      return p.productName?.trim() !== productData.productName?.trim();
    });

    // Add all variants with formatted prices
    const newVariants = productData.variants.map(variant => ({
      ...variant,
      productId: productData.productId,
      productName: productData.productName,
      currencyCode: productData.currencyCode,
      price: parsePrice(variant.price),
      specialPrice: parsePrice(variant.specialPrice),
      // Keep existing id if editing, generate tmpId if new
      id: variant.id,
      tmpId:
        variant.tmpId || (!variant.id ? Math.random().toString(36) : undefined),
    }));

    remainingProducts.push(...newVariants);

    setStoreEdition({ ...storeEdition, products: remainingProducts });
    navigation.goBack();
  };

  const selectedProduct = products.find(
    ({ id }) => id === productData.productId,
  );

  const removeProduct = () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer ce produit et tous ses variants ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            const remainingProducts = (storeEdition?.products || []).filter(
              p => {
                if (productData.productId) {
                  return p.productId !== productData.productId;
                }
                return (
                  p.productName?.trim() !== productData.productName?.trim()
                );
              },
            );
            setStoreEdition({ ...storeEdition, products: remainingProducts });
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          {selectedProduct?.name || productData.productName}
        </Text>
        <TouchableRipple
          onPress={() => navigation.navigate('SelectCurrency')}
          borderless
          style={styles.currencyButton}>
          <Text variant="titleMedium">
            {currencies[productData.currencyCode].symbol}
          </Text>
        </TouchableRipple>
      </View>

      {/* Variants table header */}
      <View
        style={[
          styles.tableHeader,
          { backgroundColor: colors.surfaceVariant },
        ]}>
        <Text style={[styles.headerCell, styles.typeCell]}>Type</Text>
        <Text style={[styles.headerCell, styles.volumeCell]}>Vol.</Text>
        <Text style={[styles.headerCell, styles.priceCell]}>Prix</Text>
        <Text style={[styles.headerCell, styles.priceCell]}>HH</Text>
        <View style={styles.actionCell} />
      </View>

      {/* Variants list */}
      {productData.variants.map((variant, index) => (
        <View key={index} style={styles.variantRow}>
          {/* Type selector - compact */}
          <View style={styles.typeCell}>
            <Menu
              visible={openTypeMenu === index}
              onDismiss={() => setOpenTypeMenu(null)}
              anchor={
                <IconButton
                  onPress={() =>
                    setOpenTypeMenu(openTypeMenu === index ? null : index)
                  }
                  style={styles.typeButton}
                  icon={variant.type === 'draft' ? 'beer' : 'bottle-soda'}
                />
              }>
              <Menu.Item
                onPress={() => {
                  updateVariant(index, 'type', 'draft');
                  setOpenTypeMenu(null);
                }}
                title="Pression"
                leadingIcon={variant.type === 'draft' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => {
                  updateVariant(index, 'type', 'bottle');
                  setOpenTypeMenu(null);
                }}
                title="Bouteille"
                leadingIcon={variant.type === 'bottle' ? 'check' : undefined}
              />
            </Menu>
          </View>

          {/* Volume */}
          <TextInput
            style={[styles.compactInput, styles.volumeCell]}
            mode="flat"
            dense
            onChangeText={volume => updateVariant(index, 'volume', volume)}
            value={String(variant.volume)}
            keyboardType="numeric"
            returnKeyType="done"
            right={<TextInput.Affix text="cl" textStyle={styles.affixText} />}
            selectTextOnFocus
            textAlignVertical="center"
          />

          {/* Price */}
          <TextInput
            autoFocus={
              index === 0 &&
              !!(route.params?.productId || route.params?.productName)
            }
            style={[styles.compactInput, styles.priceCell]}
            mode="flat"
            dense
            onChangeText={price => updateVariant(index, 'price', price)}
            value={variant.price ? String(variant.price) : ''}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
          />

          {/* Special Price (HH) */}
          <TextInput
            style={[styles.compactInput, styles.priceCell]}
            mode="flat"
            dense
            onChangeText={specialPrice =>
              updateVariant(index, 'specialPrice', specialPrice)
            }
            value={variant.specialPrice ? String(variant.specialPrice) : ''}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
          />

          {/* Delete button */}
          <View style={styles.actionCell}>
            {productData.variants.length > 1 && (
              <IconButton
                icon="delete-outline"
                size={20}
                onPress={() => removeVariant(index)}
              />
            )}
          </View>
        </View>
      ))}

      <Button
        mode="outlined"
        icon="plus"
        compact
        style={styles.addButton}
        onPress={addVariant}>
        Ajouter
      </Button>

      {productData.variants.some(v => v.id || v.tmpId) && (
        <Button
          mode="contained"
          color={theme.colors.danger}
          style={styles.removeButton}
          onPress={removeProduct}>
          Supprimer le produit
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 20,
  },
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginLeft: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  typeCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeText: {
    fontSize: 20,
  },
  volumeCell: {
    width: 90,
    marginHorizontal: 4,
  },
  priceCell: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInput: {
    height: 40,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  affixText: {
    fontSize: 11,
    textAlignVertical: 'center',
  },
  addButton: {
    marginTop: 12,
    marginBottom: 16,
  },
  removeButton: {
    marginTop: 8,
    marginBottom: 20,
  },
});

export default EditProducts;
