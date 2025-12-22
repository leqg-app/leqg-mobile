import React, { useMemo } from 'react';
import { Alert, StyleSheet, View, Linking } from 'react-native';
import { Avatar, TouchableRipple, useTheme } from 'react-native-paper';
import Share from 'react-native-share';
import { useSetAtom, useAtomValue } from 'jotai';
import { useNavigation } from '@react-navigation/native';

import { sheetStoreState, storeState, userState } from '../../store/atoms';
import { useFavoriteState } from '../../store/hooks';

export function ActionButton({ name, icon, onPress, color }) {
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
      <Text variant="bodyMedium" style={styles.actionCaption}>
        {name}
      </Text>
    </View>
  );
}

export function shareStore(store) {
  Share.open({
    title: 'Retrouvons nous',
    message: `Retrouvons nous au ${store.name}\n\n${store.address}`,
  }).catch(() => {});
}

function call(store) {
  if (store?.phone) {
    Linking.openURL(`tel:${store.phone}`);
  }
}

function StoreActionButtons({ id }) {
  const { colors } = useTheme();
  const store = useAtomValue(storeState(id));
  const user = useAtomValue(userState);
  const setSheetStore = useSetAtom(sheetStoreState);
  const navigation = useNavigation();
  const { addFavorite, removeFavorite } = useFavoriteState();

  const isFavorite = useMemo(() => {
    if (!user) {
      return;
    }
    const { favorites = [] } = user;
    return favorites.some(favorite => favorite.id === store.id);
  }, [user]);

  const toggleFavorite = () => {
    if (!user) {
      Alert.alert(
        '',
        'Vous devez être connecté pour enregistrer ce bar dans vos favoris',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Connexion',
            onPress: () => {
              navigation.navigate('AccountTab');
              setSheetStore();
            },
          },
        ],
        { cancelable: true },
      );
      return;
    }
    if (isFavorite) {
      removeFavorite(store);
    } else {
      addFavorite(store);
    }
  };

  return (
    <>
      <ActionButton
        onPress={toggleFavorite}
        name="Enregistrer"
        color={isFavorite ? 'gold' : colors.onPrimary}
        icon={isFavorite ? 'star' : 'star-outline'}
        disabled
      />
      {store.phone && (
        <ActionButton
          onPress={() => call(store)}
          name="Appeler"
          icon="phone"
          color={colors.onPrimary}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
});

export default StoreActionButtons;
