import React, { Fragment, useState } from 'react';
import { Platform, StyleSheet, Text, View, Linking } from 'react-native';
import {
  Avatar,
  Button,
  Caption,
  DataTable,
  Dialog,
  Divider,
  Paragraph,
  Portal,
  Subheading,
  TouchableRipple,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';

import { useStore } from '../../store/context';
import { daysFull } from '../../constants';

function ActionButton({ name, icon, onPress }) {
  return (
    <View>
      <TouchableRipple
        style={styles.actionRipple}
        borderless
        centered
        onPress={onPress}
        rippleColor="rgba(0, 0, 0, .25)">
        <Avatar.Icon style={styles.action} size={45} icon={icon} />
      </TouchableRipple>
      <Caption>{name}</Caption>
    </View>
  );
}

function Schedules({ schedules }) {
  const days = schedules.reduce(
    (days, schedule) => ((days[schedule.dayOfWeek] = schedule), days),
    {},
  );
  return (
    <View style={styles.infoText}>
      {daysFull.map((day, i) => (
        <View key={day} style={styles.scheduleRow}>
          <Text style={styles.scheduleRowDay}>{day}</Text>
          <Text style={styles.scheduleRowDay}>
            {days[i + 1]?.alwaysOpen ? 'Ouvert' : 'Fermé'}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Product({ product }) {
  const [state] = useStore();
  const { volume, price, specialPrice, productName } = product;
  const productDetail = state.products[product.product];
  return (
    <Fragment>
      <View style={styles.product}>
        <View style={styles.productName}>
          <Text>{productDetail?.name || productName || 'Blonde'}</Text>
        </View>
        <View style={styles.productDetails}>
          {volume && (
            <View style={styles.productCell}>
              <Text>{volume}cl</Text>
            </View>
          )}
          {price && (
            <View style={styles.productCell}>
              <Text>{price}€</Text>
            </View>
          )}
          {specialPrice && (
            <View style={styles.productCell}>
              <Text>{specialPrice}€</Text>
            </View>
          )}
        </View>
      </View>
      <Divider />
    </Fragment>
  );
}

const StoreDetails = ({ store }) => {
  const [state, actions] = useStore();
  const navigation = useNavigation();
  const [modalLogin, setModalLogin] = useState(false);

  const [expandSchedules, setExpandSchedules] = React.useState(false);

  const openAddress = () => {
    const { name, latitude, longitude, address } = store;
    const encodedName = encodeURIComponent(name);
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedName}@${latitude},${longitude}`,
      android: `https://www.google.com/maps/search/${encodedName},+${encodedAddress}?hl=fr`,
    });
    Linking.openURL(url);
  };

  const toggleFavorite = () => {
    if (!state.user?.id) {
      setModalLogin(true);
      return;
    }
    if (isFavorite()) {
      actions.removeFavorite(store);
    } else {
      actions.addFavorite(store);
    }
  };

  const isFavorite = () => {
    if (!state.user?.id) {
      return;
    }
    const { favorites = [] } = state.user;
    return favorites.some(favorite => favorite.id === store.id);
  };

  return (
    <View>
      <View style={styles.actionsBar}>
        <ActionButton
          onPress={() => openAddress()}
          name="Itinéraire"
          icon="google-maps"
        />
        <ActionButton onPress={() => {}} name="Partager" icon="share-variant" />
        <ActionButton
          onPress={toggleFavorite}
          name="Enregistrer"
          icon={isFavorite() ? 'star' : 'star-outline'}
        />
      </View>
      <Divider />
      <TouchableRipple
        onPress={() => openAddress()}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="map-marker"
            color="green"
          />
          <Text style={styles.infoText}>{store.address}</Text>
        </View>
      </TouchableRipple>
      <Divider />
      <TouchableRipple
        onPress={() => setExpandSchedules(!expandSchedules)}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="clock"
            color="green"
          />
          {!expandSchedules ? (
            <Text style={styles.infoText}>Ouvert </Text>
          ) : (
            <Schedules schedules={store.schedules} />
          )}
        </View>
      </TouchableRipple>
      {expandSchedules && (
        <Button mode="text" uppercase={false}>
          Ajouter ou modifier ces horaires
        </Button>
      )}
      <Divider />
      {/* <TouchableRipple
        onPress={() => openAddress()}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="earth"
            color="green"
          />
          <Text style={styles.infoText}>https://google.com/</Text>
        </View>
      </TouchableRipple>
      <Divider /> */}
      <TouchableRipple
        onPress={() => navigation.navigate('EditStoreScreen', { store })}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="pencil"
            color="green"
          />
          <Text style={styles.infoText}>Suggérer une modification</Text>
        </View>
      </TouchableRipple>
      <Divider />
      <Subheading style={styles.subtitle}>Bières</Subheading>
      <DataTable>
        <DataTable.Header />
        {store.products.map(product => (
          <Product key={product.id} product={product} />
        ))}
      </DataTable>
      {/* <Subheading>Résumé des avis</Subheading>
      <Divider />
      <Subheading>Donner une note et un avis</Subheading>
      <Text>
        Partagez votre expérience pour aider les autres utilisateurs dans leurs
        recherches
      </Text>
      <View style={styles.infoRow}>
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color="green"
          size={30}
          onPress={() => console.log('Pressed')}
        />
      </View> */}
      {modalLogin && (
        <Portal>
          <Dialog visible={true} onDismiss={() => setModalLogin(false)}>
            <Dialog.Content>
              <Paragraph>
                Vous devez être connecté pour enregistrer ce bar dans vos
                favoris
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setModalLogin(false)}>Annuler</Button>
              <Button
                onPress={() => {
                  setModalLogin(false);
                  navigation.navigate('AccountTab');
                }}>
                Connexion
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionsBar: {
    marginHorizontal: 30,
    marginVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionRipple: {
    width: 60,
    height: 60,
    borderRadius: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  infoIcon: {
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  infoText: {
    marginVertical: 20,
  },
  scheduleRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  scheduleRowDay: {
    width: '50%',
  },
  subtitle: {
    marginLeft: 15,
    marginTop: 15,
    marginBottom: -35,
    fontWeight: 'bold',
  },
  product: {
    margin: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    display: 'flex',
    justifyContent: 'center',
    width: '60%',
  },
  productDetails: {
    display: 'flex',
    flexDirection: 'row',
  },
  productCell: {
    width: 40,
  },
});

export default StoreDetails;
