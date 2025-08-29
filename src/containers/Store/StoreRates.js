import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert, StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import StarRating from 'react-native-star-rating-widget';
import { useAtomValue, useSetAtom } from 'jotai';

import { sheetStoreState, userState } from '../../store/atoms';

function StoreRates({ store }) {
  const navigation = useNavigation();
  const setSheetStore = useSetAtom(sheetStoreState);
  const user = useAtomValue(userState);
  const { rate, rateCount, name, rates = [] } = store;

  const userRate = user && rates.find(rate => rate.user?.id === user.id);

  const navigateRatingStore = rate => {
    if (!user) {
      Alert.alert(
        '',
        'Vous devez être connecté pour partager votre avis',
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
    navigation.navigate('RatingStore', { rate, storeName: name });
  };

  return (
    <View>
      {rate ? (
        <View style={styles.summary}>
          <View style={styles.rate}>
            <Text variant="headlineLarge">
              {rate.toFixed(1).replace('.', ',')}
            </Text>
            <Text variant="labelSmall">({rateCount})</Text>
          </View>
          <StarRating rating={Math.round(rate * 2) / 2} onChange={() => {}} />
        </View>
      ) : (
        <View style={styles.summary}>
          <Text>Aucune note pour le moment</Text>
        </View>
      )}
      <Divider />
      {userRate ? (
        <View style={styles.rating}>
          <Text style={styles.giveStars}>Votre avis</Text>
          <View style={styles.stars}>
            <StarRating
              rating={(userRate.rate1 + userRate.rate2 + userRate.rate3) / 3}
              onChange={() => {}}
              emptyColor="grey"
            />
          </View>
        </View>
      ) : (
        <View style={styles.rating}>
          <Text style={styles.giveStars}>Donner une note</Text>
          <Text>Partagez votre expérience à la communauté</Text>
          <View style={styles.stars}>
            <StarRating
              enableHalfStar={false}
              rating={0}
              onChange={navigateRatingStore}
              emptyColor="grey"
            />
          </View>
        </View>
      )}
      <Divider />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  rate: {
    alignItems: 'center',
    marginRight: 20,
  },
  rating: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  giveStars: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: 'bold',
  },
  stars: {
    marginVertical: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default StoreRates;
