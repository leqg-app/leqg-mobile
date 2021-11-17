import React, { Fragment, useState } from 'react';
import { Platform, StyleSheet, Text, View, Linking } from 'react-native';
import {
  Avatar,
  Button,
  Caption,
  DataTable,
  Dialog,
  Divider,
  IconButton,
  Paragraph,
  Portal,
  Subheading,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';

import { useStore } from '../../store/context';
import { daysFull } from '../../constants';
import { inHours, secondToTime } from '../../utils/time';

function Open({ day }) {
  const { closing, openingSpecial, closingSpecial } = day;
  return (
    <View style={styles.infoScheduleState}>
      <View>
        <Text style={styles.scheduleOpen}>Ouvert</Text>
      </View>
      <View style={{ marginLeft: 20 }}>
        {closing && <Text>Ferme à {secondToTime(closing)}</Text>}
        {openingSpecial && (
          <Text>
            Happy hour de {secondToTime(openingSpecial)} à{' '}
            {secondToTime(closingSpecial)}
          </Text>
        )}
      </View>
    </View>
  );
}

function Closed({ day }) {
  const { opening } = day;
  return (
    <View style={styles.infoScheduleState}>
      <Text style={styles.scheduleClosed}>Fermé</Text>
      {opening && <Text>&bull; Ouvre à {secondToTime(opening)}</Text>}
    </View>
  );
}

function TodaySchedule({ schedules }) {
  const date = new Date();
  const today = date.getDay() || 7;
  const now = date.getHours() * 3600 + date.getMinutes() * 60;
  const day = schedules.find(schedule => schedule.dayOfWeek === today);
  const { closed, opening, closing, openingSpecial } = day;

  if (closed) {
    return <Closed day={day} />;
  }
  if (opening) {
    if (inHours(opening, closing)) {
      return <Open day={day} />;
    }
    if (now < opening) {
      return <Closed day={day} />;
    }
    // TODO: find next day
    return <Closed day={day} />;
  }
  return <Open day={day} />;
}

function getSchedule(day) {
  const { closed, opening, closing, openingSpecial, closingSpecial } = day;
  if (closed) {
    return <Text style={styles.scheduleStateCell}>Fermé</Text>;
  }
  const normal = opening && closing;
  const special = openingSpecial && closingSpecial;
  if (normal && special) {
    return (
      <View style={styles.scheduleHourRow}>
        <Text style={styles.scheduleHourCell}>
          {secondToTime(opening)}-{secondToTime(closing)}
        </Text>
        <Text style={styles.scheduleHourCell}>
          {secondToTime(openingSpecial)}-{secondToTime(closingSpecial)}
        </Text>
      </View>
    );
  }
  if (normal) {
    return (
      <View style={styles.scheduleHourRow}>
        <Text style={styles.scheduleHourCell}>
          {secondToTime(opening)}-{secondToTime(closing)}
        </Text>
        <Text style={styles.scheduleHourCell}>-</Text>
      </View>
    );
  }
  if (special) {
    return (
      <View style={styles.scheduleHourRow}>
        <Text style={styles.scheduleHourCell}>-</Text>
        <Text style={styles.scheduleHourCell}>
          {secondToTime(openingSpecial)}-{secondToTime(closingSpecial)}
        </Text>
      </View>
    );
  }
  return <Text style={styles.scheduleStateCell}>Ouvert</Text>;
}

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
  const today = new Date().getDay();
  const day = today ? today - 1 : 6;
  const ordered = schedules.reduce(
    (days, schedule) => ((days[schedule.dayOfWeek - 1] = schedule), days),
    [],
  );
  const days = ordered.slice(day).concat(ordered.slice(0, day));
  return (
    <View style={{ display: 'flex', flex: 1 }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: 20,
        }}>
        <View style={{ width: '40%' }} />
        <Text style={styles.scheduleHourCell}>Ouverture</Text>
        <Text style={styles.scheduleHourCell}>Happy Hour</Text>
      </View>
      <View style={styles.infoText}>
        {days.map(day => (
          <View key={day.dayOfWeek} style={styles.scheduleDayRow}>
            <Text style={styles.scheduleDayCell}>
              {daysFull[day.dayOfWeek - 1]}
            </Text>
            {getSchedule(day)}
          </View>
        ))}
      </View>
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
  const { colors } = useTheme();
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
          onPress={openAddress}
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
      <TouchableRipple onPress={openAddress} rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="map-marker"
            color={colors.primary}
          />
          <Text style={styles.infoText}>{store.address}</Text>
        </View>
      </TouchableRipple>
      <Divider />
      <TouchableRipple
        onPress={() => setExpandSchedules(!expandSchedules)}
        rippleColor="rgba(0, 0, 0, .25)">
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={styles.infoRow}>
            <Avatar.Icon
              style={styles.infoIcon}
              size={40}
              icon="clock"
              color={colors.primary}
            />
            {!expandSchedules ? (
              <TodaySchedule schedules={store.schedules} />
            ) : (
              <Schedules schedules={store.schedules} />
            )}
          </View>
          {!expandSchedules && <IconButton icon="chevron-down" color="grey" />}
        </View>
      </TouchableRipple>
      {expandSchedules && (
        <Button mode="text" uppercase={false}>
          Ajouter ou modifier ces horaires
        </Button>
      )}
      <Divider />
      {/* <TouchableRipple
        onPress={openAddress}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="earth"
            color={colors.primary}
          />
          <Text style={styles.infoText}>https://google.com/</Text>
        </View>
      </TouchableRipple>
      <Divider /> */}
      <TouchableRipple
        onPress={() =>
          navigation.navigate('EditStoreScreen', {
            screen: 'EditStore',
            params: { store },
          })
        }
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="pencil"
            color={colors.primary}
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
          color={colors.primary}
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color={colors.primary}
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color={colors.primary}
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color={colors.primary}
          size={30}
          onPress={() => console.log('Pressed')}
        />
        <IconButton
          icon="star-outline"
          color={colors.primary}
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
  infoScheduleState: {
    marginVertical: 20,
    display: 'flex',
    flexDirection: 'row',
  },
  scheduleOpen: {
    color: 'green',
  },
  scheduleClosed: {
    color: '#ff586b',
  },
  scheduleDayRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  scheduleDayCell: {
    width: '40%',
  },
  scheduleHourRow: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  scheduleHourCell: {
    width: 90,
    textAlign: 'center',
  },
  scheduleStateCell: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    textAlign: 'center',
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
