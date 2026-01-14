import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StoreProducts from './StoreProducts';
import SelectProduct from '../EditStore/SelectProduct';
import EditProduct from '../EditStore/EditProduct';
import SelectCurrency from '../EditStore/SelectCurrency';

const StoreProductsList = ({ navigation }) => {
  const route = useRoute();
  const { storeId, editMode: initialEditMode } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <StoreProducts
          storeId={storeId}
          initialEditMode={initialEditMode}
          navigation={navigation}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

const StoreProductsStack = createNativeStackNavigator();

export default () => (
  <StoreProductsStack.Navigator screenOptions={{ headerShown: false }}>
    <StoreProductsStack.Screen
      name="StoreProductsList"
      component={StoreProductsList}
      options={{ headerShown: true, title: 'Carte' }}
    />
    <StoreProductsStack.Screen
      options={{ headerShown: true, title: 'Ajouter une bière' }}
      name="SelectProduct"
      component={SelectProduct}
    />
    <StoreProductsStack.Screen
      options={{ headerShown: true, title: 'Modifier une bière' }}
      name="EditProduct"
      component={EditProduct}
    />
    <StoreProductsStack.Screen
      options={{ headerShown: true, title: 'Devise' }}
      name="SelectCurrency"
      component={SelectCurrency}
    />
  </StoreProductsStack.Navigator>
);
