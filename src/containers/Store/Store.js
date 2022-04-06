import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View, Linking } from 'react-native';
import {
  Avatar,
  Button,
  Caption,
  Dialog,
  Divider,
  IconButton,
  Paragraph,
  Portal,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import { useStore } from '../../store/context';

import StoreProducts from './StoreProducts';
import SchedulesPreview from './SchedulesPreview';
import Schedules from './Schedules';

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
      <Caption>{name}</Caption>
    </View>
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

  const editStore = () =>
    navigation.navigate('EditStoreScreen', {
      screen: 'EditStore',
      params: { store },
    });

  return (
    <View>
      <View style={styles.actionsBar}>
        <ActionButton
          onPress={() => openAddress(store)}
          name="Itinéraire"
          icon="directions"
        />
        <ActionButton onPress={() => {}} name="Partager" icon="share-variant" />
        <ActionButton
          onPress={toggleFavorite}
          name="Enregistrer"
          color={isFavorite() ? 'gold' : 'white'}
          icon={isFavorite() ? 'star' : 'star-outline'}
        />
      </View>
      <Divider />
      <TouchableRipple
        onPress={() => openAddress(store)}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.row}>
          <View style={styles.infoRow}>
            <Avatar.Icon
              style={styles.infoIcon}
              size={40}
              icon="map-marker"
              color={colors.primary}
            />
            <Text style={styles.infoText}>{store.address}</Text>
          </View>
          <IconButton icon="chevron-right" color="grey" />
        </View>
      </TouchableRipple>
      <Divider />
      <TouchableRipple
        onPress={() => setExpandSchedules(!expandSchedules)}
        rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.row}>
          <View style={styles.infoRow}>
            <Avatar.Icon
              style={styles.infoIcon}
              size={40}
              icon="clock"
              color={colors.primary}
            />
            {!expandSchedules ? (
              <View style={styles.infoText}>
                <SchedulesPreview schedules={store.schedules} />
              </View>
            ) : (
              <View style={styles.schedulesWrapper}>
                <Schedules schedules={store.schedules} />
              </View>
            )}
          </View>
          {!expandSchedules && <IconButton icon="chevron-down" color="grey" />}
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
      <TouchableRipple onPress={editStore} rippleColor="rgba(0, 0, 0, .25)">
        <View style={styles.infoRow}>
          <Avatar.Icon
            style={styles.infoIcon}
            size={40}
            icon="pencil"
            color={colors.primary}
          />
          <Text style={styles.infoTextItalic}>Suggérer une modification</Text>
        </View>
      </TouchableRipple>
      <Divider />
      <StoreProducts products={store.products} />
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
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoIcon: {
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  infoText: {
    flex: 1,
    marginVertical: 20,
  },
  infoTextItalic: {
    marginVertical: 20,
    fontStyle: 'italic',
  },
  schedulesWrapper: {
    marginTop: 20,
    flex: 1,
  },
});

export default StoreDetails;
