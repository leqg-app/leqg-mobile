import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import StarRating from 'react-native-star-rating-widget';

function StoreRates({ rate, rateCount, storeName }) {
  const navigation = useNavigation();

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
      <View style={styles.rating}>
        <Text style={styles.giveStars}>Donner une note</Text>
        <Text>Partagez votre expérience à la communauté</Text>
        <View style={styles.stars}>
          <StarRating
            enableHalfStar={false}
            rating={0}
            onChange={rate =>
              navigation.navigate('RatingStore', { rate, storeName })
            }
            emptyColor="grey"
          />
        </View>
      </View>
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
    fontSize: 16,
    fontWeight: 800,
  },
  stars: {
    marginVertical: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default StoreRates;
