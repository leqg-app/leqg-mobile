import React, { memo } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import formatDistance from 'date-fns/formatDistance';
import dateLocale from 'date-fns/locale/fr';

import { sortBy } from '../../utils/sorter';

const actions = {
  created: 'ajout',
  updated: 'modification',
  deleted: 'suppression',
};
const targets = {
  name: 'du nom',
  phone: 'du téléphone',
  website: 'du site internet',
  address: "de l'adresse",
  products: "d'une bière",
  schedules: 'des horaires',
  features: "d'une caractéristique",
};

const RevisionEdition = memo(({ revision }) => {
  if (revision.type === 'initial') {
    return (
      <View>
        <Text>- création du bar</Text>
      </View>
    );
  }
  const action = actions[revision.type] || 'modification';
  const target = targets[revision.field] || "d'un champ";
  return (
    <View>
      <Text>
        - {action} {target}
      </Text>
    </View>
  );
});

const RevisionRow = memo(({ revision }) => {
  const author = revision.user?.username || 'anonyme';
  const date = formatDistance(new Date(revision.createdAt), Date.now(), {
    addSuffix: true,
    locale: dateLocale,
  });

  return (
    <View style={styles.revisionRow}>
      <View style={styles.flex}>
        <Text style={styles.revisionAuthor}>{author}</Text>
        <Text style={styles.revisionDate}>{date}</Text>
      </View>
      <View style={styles.revisionContainer}>
        {revision.changes.map((revision, index) => (
          <RevisionEdition revision={revision} key={index} />
        ))}
      </View>
    </View>
  );
});

const History = ({ route }) => {
  const { store } = route.params;

  const revisions = Array.from(store.revisions).sort(sortBy('creation_date'));

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={revisions}
        renderItem={({ item }) => <RevisionRow revision={item} />}
        keyExtractor={revision => revision.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revisionAuthor: {
    flex: 1,
  },
  revisionDate: {
    flex: 1,
    textAlign: 'right',
    color: '#555',
  },
  revisionContainer: {
    marginTop: 10,
  },
  revisionRow: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  customName: {
    fontWeight: 'bold',
  },
});

export default History;
