import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Appbar, Title, ToggleButton } from 'react-native-paper';

import Header from '../../components/Header';
import { useStore } from '../../store/context';

const EditProducts = ({ navigation, route }) => {
  const [state] = useStore();
  const [beer, setBeer] = useState({});
  const [type, setType] = React.useState('draft');

  console.log(beer);

  useEffect(() => {
    console.log(route.params);
    if (!route.params) {
      // WTF
      return;
    }
    const { productName, productId } = route.params;
    if (productId) {
      setBeer(state.products.find(product => product.id === productId));
      return;
    }
    setBeer({
      name: productName,
    });
  }, [route.params]);

  return (
    <SafeAreaView>
      <Header>
        <Appbar.BackAction onPress={() => navigation.navigate('EditStore')} />
        <Appbar.Content title="Ajouter une bière" />
        <Appbar.Action icon="content-save" />
      </Header>
      <View style={styles.box}>
        <Title>{beer.name}</Title>
        <ToggleButton.Row onValueChange={setType} value={type}>
          <ToggleButton value="draft">
            <Text>Pression</Text>
          </ToggleButton>
          <ToggleButton value="bottle">
            <Text>Bouteille</Text>
          </ToggleButton>
        </ToggleButton.Row>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 20,
  },
  dayRow: {
    flexDirection: 'row',
    padding: 14,
  },
  editIcon: { backgroundColor: 'transparent' },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dayButtonEmpty: {
    marginRight: 7,
    borderWidth: 2,
    borderColor: 'green',
    backgroundColor: 'transparent',
    color: 'green',
  },
  dayButtonFilled: {
    marginRight: 7,
    borderWidth: 2,
    borderColor: 'green',
    backgroundColor: 'green',
    color: 'white',
  },
  buttonEditAll: {
    marginTop: 30,
  },
  modalScroll: {
    maxHeight: 300,
  },
});

export default EditProducts;
