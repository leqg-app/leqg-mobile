import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Appbar, Button } from 'react-native-paper';

const Products = ({ navigation }) => {
  const save = () => {};

  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Bières" />
      </Appbar.Header>
      <View style={styles.box}>
        <Button
          mode="contained"
          compact={true}
          icon="plus"
          uppercase={false}
          style={styles.buttonEditAll}
          onPress={() => {}}>
          Ajouter
        </Button>
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

export default Products;
