import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  IconButton,
  Button,
  Text,
  Divider,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from 'react-native-star-rating-widget';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { getErrorMessage } from '../../utils/errorMessage';
import { sheetStoreState, storeState, userState } from '../../store/atoms';
import { rateStore } from '../../api/stores';

const ERROR_MESSAGES = {
  'store.notfound': "Ce lieu n'existe pas ou plus",
  'store.rate.duplicate': 'Vous avez déjà donné votre avis à ce lieu',
};

const RatingStore = ({ navigation, route }) => {
  const { rate } = route.params;

  const [sheetStore, setSheetStore] = useRecoilState(sheetStoreState);
  const setStore = useSetRecoilState(storeState(sheetStore.id));

  const user = useRecoilValue(userState);
  const [state, setState] = useState({ loading: false, error: undefined });

  const [rate1, setValueMoneyRate] = useState(rate);
  const [rate2, setPlaceRate] = useState(rate);
  const [rate3, setWelcomeRate] = useState(rate);

  // TODO:
  const recommendedProducts = [];
  const comment = '';

  const storeRate = (rate1 + rate2 + rate3) / 3;

  const publish = async () => {
    setState({ loading: true, error: undefined });
    try {
      const data = { rate1, rate2, rate3, comment, recommendedProducts };
      const response = await rateStore(sheetStore.id, data, user);
      if (response.error) {
        throw response.error;
      }
      setState({ loading: false, error: undefined });

      const {
        store: { rate, rateCount },
        reputation,
      } = response;
      setStore(store => ({ ...store, rate, rateCount }));
      setSheetStore(store => ({ ...store, rate, rateCount }));

      navigation.replace('WonReputation', { reputation });
    } catch (err) {
      setState({ loading: false, error: getErrorMessage(err, ERROR_MESSAGES) });
    }
  };

  const close = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.view}>
      <View style={styles.head}>
        <IconButton icon="close" onPress={close} />
        <Text style={styles.storeName}>{sheetStore.name}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.intro}>
          Dites nous en plus sur votre expérience
        </Text>
        <Text style={styles.label}>Le rapport qualité/prix:</Text>
        <View style={styles.rateRow}>
          <StarRating
            enableHalfStar={false}
            rating={rate1}
            onChange={setValueMoneyRate}
          />
          <Text style={styles.rateDetail}>{rate1}/5</Text>
        </View>
        <Text style={styles.label}>Le lieu:</Text>
        <View style={styles.rateRow}>
          <StarRating
            enableHalfStar={false}
            rating={rate2}
            onChange={setPlaceRate}
          />
          <Text style={styles.rateDetail}>{rate2}/5</Text>
        </View>
        <Text style={styles.label}>L&apos;accueil:</Text>
        <View style={styles.rateRow}>
          <StarRating
            enableHalfStar={false}
            rating={rate3}
            onChange={setWelcomeRate}
          />
          <Text style={styles.rateDetail}>{rate3}/5</Text>
        </View>
        <Divider />
        <View style={styles.finalNote}>
          <Text style={styles.label}>Note finale:</Text>
          <View style={styles.rateRow}>
            <StarRating
              rating={Math.round(storeRate * 2) / 2}
              onChange={() => {}}
            />
            <Text style={styles.rateDetail}>{storeRate.toFixed(1)}/5</Text>
          </View>
        </View>
        <Button
          onPress={publish}
          mode="contained"
          style={styles.closeButton}
          loading={state.loading}
          disabled={state.loading}>
          Publier
        </Button>
        {state.error && <HelperText type="error">{state.error}</HelperText>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  storeName: {
    fontSize: 19,
    fontWeight: 'bold',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  intro: {
    fontSize: 17,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  rateDetail: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: 'bold',
    width: 45,
    textAlign: 'right',
  },
  finalNote: {
    marginTop: 20,
  },
  closeButton: {
    marginTop: 20,
  },
});

export default RatingStore;
