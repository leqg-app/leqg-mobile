import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Appbar, RadioButton, TextInput, Title } from 'react-native-paper';

import Header from '../../components/Header';
import { useStore } from '../../store/context';

const EditProducts = ({ navigation, route }) => {
  const [state] = useStore();
  const [beer, setBeer] = useState({});
  const [type, setType] = React.useState('draft');
  const [volume, setVolume] = React.useState(50);
  const [price, setPrice] = React.useState(undefined);
  const [specialPrice, setSpecialPrice] = React.useState(undefined);

  useEffect(() => {
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
  }, [route.params]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeType = type => {
    setType(type);
    if (type === 'draft') {
      setVolume(50);
    } else {
      setVolume(33);
    }
  };

  return (
    <SafeAreaView>
      <Header>
        <Appbar.BackAction onPress={() => navigation.navigate('EditStore')} />
        <Appbar.Content title="Ajouter une bière" />
        <Appbar.Action icon="content-save" />
      </Header>
      <View style={styles.box}>
        <Title>{beer.name}</Title>
        <View style={styles.typeGroup}>
          <RadioButton.Group onValueChange={changeType} value={type}>
            <View style={styles.typeChoice}>
              <RadioButton value="draft" color="green" />
              <Text>Pression</Text>
            </View>
            <View style={styles.typeChoice}>
              <RadioButton value="bottle" color="green" />
              <Text>Bouteille</Text>
            </View>
          </RadioButton.Group>
        </View>
        <TextInput
          style={{
            marginTop: 10,
            marginBottom: 15,
            backgroundColor: 'transparent',
          }}
          label="Volume"
          mode="flat"
          onChangeText={volume => setVolume(volume)}
          value={volume}
          keyboardType="numeric"
          returnKeyType="done"
        />
        <TextInput
          style={{
            marginTop: 10,
            marginBottom: 15,
            backgroundColor: 'transparent',
          }}
          label="Prix"
          mode="flat"
          onChangeText={price => setPrice(price)}
          value={price}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        <TextInput
          style={{
            marginTop: 10,
            marginBottom: 15,
            backgroundColor: 'transparent',
          }}
          label="Prix en Happy hour"
          mode="flat"
          onChangeText={specialPrice => setSpecialPrice(specialPrice)}
          value={specialPrice}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
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
  typeGroup: {
    marginTop: 10,
  },
  typeChoice: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
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
