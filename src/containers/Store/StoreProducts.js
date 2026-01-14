import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  Text,
  TouchableRipple,
  ActivityIndicator,
  Portal,
  Snackbar,
  Appbar,
} from 'react-native-paper';
import { useAtomValue, useAtom } from 'jotai';

import Price from '../../components/Price';
import { sortByPrices } from '../../utils/price';
import {
  productsState,
  storeState,
  storeEditionState,
  userState,
} from '../../store/atoms';
import { useStoreActions } from '../../store/storeActions';
import { getErrorMessage } from '../../utils/errorMessage';

// TODO: load types from API
const types = {
  draft: 'Pression',
  bottle: 'Bouteille',
};

function groupByType(types, product) {
  if (!types[product.type]) {
    types[product.type] = {};
  }
  const id = product.productId || product.productName.trim();
  if (!types[product.type][id]) {
    types[product.type][id] = { ...product, prices: [] };
  }
  types[product.type][id].prices.push(product);
  return types;
}

function sortByType(a) {
  return a.type === 'draft' ? -1 : 1;
}

function StoreProducts({ storeId, initialEditMode, navigation }) {
  const products = useAtomValue(productsState);
  const store = useAtomValue(storeState(storeId));
  const user = useAtomValue(userState);
  const [storeEdition, setStoreEdition] = useAtom(storeEditionState);
  const [state, setState] = useState({
    error: false,
    isSaving: false,
    editMode: initialEditMode || false,
  });
  const { saveStore } = useStoreActions();

  const toggleEditMode = () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour modifier ce bar',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Connexion',
            onPress: () => {
              navigation.navigate('TabNavigator', {
                screen: 'AccountTab',
              });
            },
          },
        ],
        { cancelable: true },
      );
      return;
    }
    if (!state.editMode) {
      // Entrer en mode édition
      setStoreEdition(store);
      setState(prev => ({ ...prev, editMode: true }));
    }
  };

  const validateChanges = async () => {
    // Vérifier s'il y a des modifications
    if (
      storeEdition?.id === store?.id &&
      storeEdition?.products &&
      JSON.stringify(storeEdition.products) !== JSON.stringify(store.products)
    ) {
      setState(prev => ({ ...prev, isSaving: true, error: false }));
      const { error } = await saveStore(storeEdition);
      if (error) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: getErrorMessage(error),
        }));
        return;
      }
    }
    // Sortir du mode édition
    setState(prev => ({ ...prev, editMode: false, isSaving: false }));
  };

  const navigateToAddProduct = () => {
    navigation.navigate('SelectProduct');
  };

  const onProductPress = product => {
    navigation.navigate('EditProduct', { product });
  };

  // Détecter les modifications quand on revient d'un écran d'édition
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Si on revient en mode édition, s'assurer que storeEdition est initialisé
      if (state.editMode && (!storeEdition || storeEdition.id !== store?.id)) {
        setStoreEdition(store);
      }
    });

    return unsubscribe;
  }, [navigation, state.editMode, storeEdition, store]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Appbar.BackAction onPress={navigation.goBack} />,
      headerRight: () => (
        <>
          {state.editMode ? (
            <>
              <Appbar.Action icon="plus" onPress={navigateToAddProduct} />
              <Appbar.Action
                icon="check"
                onPress={validateChanges}
                disabled={state.isSaving}
              />
            </>
          ) : (
            <Appbar.Action icon="pencil" onPress={toggleEditMode} />
          )}
        </>
      ),
    });
  }, [store, user, state.editMode, state.isSaving, storeEdition]);

  const storeProducts = state.editMode
    ? storeEdition?.products || store?.products || []
    : store?.products || [];

  const hasHH = storeProducts.some(product => product.specialPrice);

  const productsByTypes = Array.from(storeProducts)
    .sort(sortByType)
    .sort(sortByPrices)
    .reduce(groupByType, {});

  return (
    <>
      {state.isSaving && (
        <View style={styles.savingOverlay}>
          <View style={styles.savingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.savingText}>Sauvegarde en cours...</Text>
          </View>
        </View>
      )}
      <View>
        <View style={[styles.row, styles.headRow]}>
          <Text style={styles.title}>Bières</Text>
        </View>
        {Object.keys(productsByTypes).map(type => (
          <View key={type}>
            <View style={styles.row}>
              <Text style={styles.typeTitle}>{types[type] || 'Autre'}</Text>
              {hasHH && (
                <View style={styles.prices}>
                  <Text style={styles.pricesCell}>Prix</Text>
                  <Text style={styles.pricesCell}>HH.</Text>
                </View>
              )}
            </View>
            {Object.values(productsByTypes[type]).map((product, i) => {
              const { productName, currencyCode } = product;
              const productDetail = products.find(
                ({ id }) => id === product.productId,
              );
              return (
                <View key={i}>
                  {product.prices.map((priceItem, priceIndex) => {
                    const { price, volume, specialPrice } = priceItem;
                    const productToEdit = {
                      ...priceItem,
                      product: productDetail,
                    };
                    return (
                      <TouchableRipple
                        key={volume}
                        onPress={() => {
                          if (state.editMode) {
                            onProductPress(productToEdit);
                          }
                        }}
                        disabled={!state.editMode}>
                        <View style={styles.row} pointerEvents="none">
                          <View style={{ flex: 1 }}>
                            <Text numberOfLines={1}>
                              {priceIndex === 0
                                ? productDetail?.name || productName || 'Bière'
                                : ''}
                            </Text>
                          </View>
                          <View style={styles.prices}>
                            <Text variant="bodyMedium">{`${volume}cl`}</Text>
                            <Text style={styles.pricesCell}>
                              {price ? (
                                <Price amount={price} currency={currencyCode} />
                              ) : (
                                '-'
                              )}
                            </Text>
                            {hasHH && (
                              <Text style={styles.pricesCell}>
                                {specialPrice ? (
                                  <Price
                                    amount={specialPrice}
                                    currency={currencyCode}
                                  />
                                ) : (
                                  ' '
                                )}
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableRipple>
                    );
                  })}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <Portal>
        <Snackbar
          visible={!!state.error}
          duration={3000}
          action={{
            label: 'OK',
          }}
          onDismiss={() => setState(prev => ({ ...prev, error: false }))}>
          {state.error}
        </Snackbar>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    minHeight: 45,
    paddingVertical: 8,
    marginLeft: 15,
    paddingRight: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headRow: {
    marginLeft: 0,
    paddingLeft: 15,
    height: 55,
  },
  typeTitle: {
    fontWeight: 'bold',
  },
  productName: {
    flex: 1,
  },
  prices: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricesCell: {
    width: 50,
    marginLeft: 10,
    textAlign: 'left',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  savingText: {
    marginTop: 10,
  },
});

export default StoreProducts;
