import React, { useState, useMemo } from 'react';
import { Platform, StyleSheet, Text, View, Linking } from 'react-native';
import {
  Avatar,
  Button,
  Caption,
  Dialog,
  Divider,
  List,
  Paragraph,
  Portal,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import Share from 'react-native-share';

import { useStore } from '../../store/context';

import StoreProducts from './StoreProducts';
import SchedulesPreview from './SchedulesPreview';
import Schedules from './Schedules';
import { theme } from '../../constants';
import { getUrlHost } from '../../utils/url';

function ActionButton({ name, icon, onPress, color = 'white' }) {
  return (
    <View>
      <TouchableRipple
        style={styles.actionRipple}
        borderless
        centered
        onPress={onPress}
        rippleColor="rgba(0, 0, 0, .25)">
        <Avatar.Icon
          style={styles.action}
          size={45}
          icon={icon}
          color={color}
        />
      </TouchableRipple>
      <Caption style={styles.actionCaption}>{name}</Caption>
    </View>
  );
}

function ListInfo({ onPress, content, icon, chevron = true }) {
  return (
    <TouchableRipple onPress={onPress} rippleColor="rgba(0, 0, 0, .25)">
      <View style={styles.row}>
        <View style={styles.infoRow}>
          <List.Icon
            style={styles.infoIcon}
            size={40}
            icon={icon}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>{content}</Text>
        </View>
        {chevron && (
          <List.Icon icon="chevron-right" color="grey" style={styles.chevron} />
        )}
      </View>
    </TouchableRipple>
  );
}

function openAddress(store) {
  const { name, latitude, longitude, address } = store;
  const encodedName = encodeURIComponent(name);
  const encodedAddress = encodeURIComponent(address);
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedName}@${latitude},${longitude}`,
    android: `https://www.google.com/maps/search/${encodedName},+${encodedAddress}?hl=fr`,
  });
  Linking.openURL(url);
}

const StoreDetails = ({ navigation, store }) => {
  const [state, actions] = useStore();
  const { colors } = useTheme();
  const [modalLogin, setModalLogin] = useState(false);

  const [expandSchedules, setExpandSchedules] = React.useState(false);

  const toggleFavorite = () => {
    if (!state.user?.id) {
      setModalLogin(true);
      return;
    }
    if (isFavorite) {
      actions.removeFavorite(store);
    } else {
      actions.addFavorite(store);
    }
  };

  const isFavorite = useMemo(() => {
    if (!state.user?.id) {
      return;
    }
    const { favorites = [] } = state.user;
    return favorites.some(favorite => favorite.id === store.id);
  }, [state.user]);

  const editStore = () =>
    navigation.navigate('EditStoreScreen', {
      screen: 'EditStore',
      params: { store },
    });

  const share = () => {
    const message = `Retrouvons nous au ${store.name}\n\n${store.address}`;
    Share.open({
      title: 'Retrouvons nous',
      message: `${message}`,
    }).catch(() => {});
  };

  const call = () => store.phone && Linking.open(`tel:${store.phone}`);

  return (
    <View>
      <View style={styles.actionsBar}>
        <ActionButton
          onPress={() => openAddress(store)}
          name="Itinéraire"
          icon="directions"
        />
        <ActionButton onPress={share} name="Partager" icon="share-variant" />
        <ActionButton
          onPress={toggleFavorite}
          name="Enregistrer"
          color={isFavorite ? 'gold' : 'white'}
          icon={isFavorite ? 'star' : 'star-outline'}
        />
        {store.phone && (
          <ActionButton onPress={call} name="Appeler" icon="phone" />
        )}
      </View>
      <Divider />
      <ListInfo
        onPress={() => openAddress(store)}
        content={store.address}
        icon="map-marker"
      />
      <Divider />
      <TouchableRipple
        onPress={() => setExpandSchedules(!expandSchedules)}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.row}>
          {!expandSchedules ? (
            <View style={styles.infoRow}>
              <List.Icon
                style={styles.infoIcon}
                size={40}
                icon="clock"
                color={colors.primary}
              />
              <SchedulesPreview schedules={store.schedules} />
            </View>
          ) : (
            <View style={styles.schedulesWrapper}>
              <Schedules schedules={store.schedules} />
            </View>
          )}
          {!expandSchedules && (
            <List.Icon
              icon="chevron-down"
              color="grey"
              style={styles.chevron}
            />
          )}
        </View>
      </TouchableRipple>
      {expandSchedules && (
        <Button onPress={editStore} mode="text" uppercase={false}>
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
      <ListInfo
        onPress={editStore}
        content={
          <Text style={styles.infoTextItalic}>Suggérer une modification</Text>
        }
        icon="pencil"
        chevron={false}
      />
      <Divider />
      <StoreProducts products={store.products} />
      {store.website && (
        <>
          <ListInfo
            onPress={() => Linking.openURL(store.website)}
            content={getUrlHost(store.website)}
            icon="earth"
          />
          <Divider />
        </>
      )}
      {store.phone && (
        <>
          <ListInfo onPress={call} content={store.phone} icon="phone" />
          <Divider />
        </>
      )}
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
  actionCaption: {
    textAlign: 'center',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoIcon: {
    marginHorizontal: 10,
    backgroundColor: 'transparent',
  },
  infoText: {
    flex: 1,
  },
  infoTextItalic: {
    fontStyle: 'italic',
  },
  chevron: {
    width: 30,
  },
  schedulesWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    flex: 1,
  },
});

export default StoreDetails;
