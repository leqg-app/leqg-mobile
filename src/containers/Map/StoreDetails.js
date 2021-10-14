import React, { Fragment } from 'react';
import { Platform, StyleSheet, Text, View, Linking } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Caption,
  DataTable,
  Divider,
  Subheading,
  Title,
  TouchableRipple,
} from 'react-native-paper';

import { useStore } from '../../store/context';
import { daysFull } from '../../constants';

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
          <View style={styles.productCell}>
            <Text>{volume}cl</Text>
          </View>
          <View style={styles.productCell}>
            <Text>{price}€</Text>
          </View>
          <View style={styles.productCell}>
            <Text>{specialPrice}€</Text>
          </View>
        </View>
      </View>
      <Divider />
    </Fragment>
  );
}

const StoreDetails = props => {
  const [state, actions] = useStore();
  const store = state.storesDetails[props.store.id];

  const [expandSchedules, setExpandSchedules] = React.useState(false);

  if (!store) {
    return (
      <View style={{ backgroundColor: 'white', height: 135 }}>
        <Title style={styles.title}>{props.store.name}</Title>
        <ActivityIndicator style={styles.loading} />
      </View>
    );
  }

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
    <View style={{ backgroundColor: 'white', minHeight: '100%' }}>
      <Title style={styles.title}>{store.name}</Title>
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
      <View style={styles.actionsBar}>
        <TouchableRipple
          borderless
          centered
          onPress={() => openAddress()}
          rippleColor="rgba(0, 0, 0, .25)">
          <Fragment>
            <Avatar.Icon style={styles.action} size={45} icon="google-maps" />
            <Caption>Itinéraire</Caption>
          </Fragment>
        </TouchableRipple>
        <View>
          <Avatar.Icon style={styles.action} size={45} icon="share-variant" />
          <Caption>Partager</Caption>
        </View>
        <TouchableRipple
          borderless
          centered
          onPress={toggleFavorite}
          rippleColor="rgba(0, 0, 0, .25)">
          <View>
            <Avatar.Icon
              style={styles.action}
              size={45}
              icon={isFavorite() ? 'star' : 'star-outline'}
            />
            <Caption>Enregistrer</Caption>
          </View>
        </TouchableRipple>
        {/* <View>
          <Avatar.Icon style={styles.action} size={45} icon="phone" />
          <Caption>Appeler</Caption>
        </View> */}
      </View>
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
        onPress={() => openAddress()}
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
        <DataTable.Header></DataTable.Header>
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: 'transparent', elevation: 0 },
  title: {
    fontWeight: 'bold',
    margin: 15,
    marginBottom: 10,
    marginTop: 20,
  },
  loading: {
    marginTop: 10,
  },
  actionsBar: {
    marginHorizontal: 30,
    marginTop: 20,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
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
