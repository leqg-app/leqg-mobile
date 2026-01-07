import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useAtomValue } from 'jotai';
import formatDistance from 'date-fns/formatDistance';
import dateLocale from 'date-fns/locale/fr';

import { userState } from '../../store/atoms';
import { getContributions } from '../../api/users';
import { LegendList } from '@legendapp/list';

const reasons = {
  'store.creation': "Création d'un bar",
  'store.edition': "Modification d'un bar",
  'store.validation.creation': "Validation d'un bar",
  'store.validation.reward': 'Remerciement pour votre contribution',
  'store.rate.creation': "Ajout d'une note à un bar",
  unknown: 'Autre',
};

const Row = ({ contribution }) => {
  const date = formatDistance(new Date(contribution.createdAt), Date.now(), {
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

const Contributions = () => {
  const user = useAtomValue(userState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadContributions = useCallback(
    async page => {
      setPage(page);
      setLoading(true);
      try {
        const newItems = await getContributions(user.jwt, page);
        if (newItems.length < 50) {
          setHasMore(false);
        }
        setData(prev => [...prev, ...newItems]);
      } catch (error) {
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [user?.jwt],
  );

  useEffect(() => {
    loadContributions(1);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) {
      return;
    }
    loadContributions(page + 1);
  }, [hasMore, loading, page, loadContributions]);

  return (
    <LegendList
      data={data}
      renderItem={({ item }) => <Row contribution={item} />}
      keyExtractor={contribution => contribution.id}
      ListFooterComponent={() =>
        loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text style={styles.grey}>{error}</Text>
        ) : (
          <Text style={styles.grey}>{data.length} contributions</Text>
        )
      }
      ListFooterComponentStyle={styles.footer}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      recycleItems
    />
  );
};

const styles = StyleSheet.create({
  contributionRow: {
    height: 65,
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
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default Contributions;
