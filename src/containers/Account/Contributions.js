import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRecoilValueLoadable, useSetRecoilState } from 'recoil';
import formatDistance from 'date-fns/formatDistance';
import dateLocale from 'date-fns/locale/fr';

import {
  contributionsState,
  storeQueryRequestIDState,
} from '../../store/atoms';
import { utcDate } from '../../utils/date';

const reasons = {
  'store.creation': "Création d'un bar",
  'store.edition': "Modification d'un bar",
  'store.validation.creation': "Validation d'un bar",
  'store.validation.reward': 'Remerciement pour votre contribution',
  'store.rate.creation': "Ajout d'une note à un bar",
  unknown: 'Autre',
};

const Row = ({ contribution }) => {
  const date = formatDistance(utcDate(contribution.createdAt), Date.now(), {
    addSuffix: true,
    locale: dateLocale,
  });
  const store = (contribution.revision || contribution.validation)?.store;
  return (
    <View style={styles.contributionRow}>
      <View style={styles.head}>
        <Text style={styles.grey}>
          {reasons[contribution.reason] || reasons.unknown}
        </Text>
        <Text style={styles.grey}>{date}</Text>
      </View>
      <Text style={styles.storeName}>{store?.name || 'Lieu supprimé'}</Text>
    </View>
  );
};

const ITEM_HEIGHT = 65;

function sortByDate(a, b) {
  return a.createdAt < b.createdAt ? 1 : -1;
}

const Contributions = () => {
  const refresh = useSetRecoilState(storeQueryRequestIDState);
  const { contents = [], state } = useRecoilValueLoadable(contributionsState);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={Array.from(contents).sort(sortByDate)}
        renderItem={({ item }) => <Row contribution={item} />}
        keyExtractor={contribution => contribution.id}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onRefresh={() => refresh(a => a + 1)}
        refreshing={state === 'loading'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contributionRow: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  head: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  grey: {
    color: '#777',
  },
  storeName: {
    fontSize: 17,
    marginTop: 5,
  },
});

export default Contributions;
