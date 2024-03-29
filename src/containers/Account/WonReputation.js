import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import {
  Title,
  IconButton,
  Card,
  Divider,
  Button,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilState } from 'recoil';

import { userState } from '../../store/atoms';
import AnimatedCircle from '../../components/AnimatedCircle';
import AnimatedText from '../../components/AnimatedText';
import { getProfile } from '../../api/users';

const DISPLAY_FIELDS = {
  name: 'Nom',
  address: 'Adresse',
  website: 'Site internet',
  phone: 'Téléphone',
  products: 'Produit(s)',
  schedules: 'Horaire(s)',
  features: 'Caractéristique(s)',
  rate: 'Note',
  comment: 'Commentaire',
  longComment: 'Bonus commentaire long',
  recommendedProduct: 'Produit(s) recommandé(s)',
};

const REASONS = {
  'store.creation': "Ajout d'un lieu",
  'store.edition': "Modification d'un lieu",
  'store.validation.creation': "Validation d'un lieu",
  'store.rate.creation': 'Note',
};

function groupFields(fields, { fieldName, reputation }) {
  if (!fields[fieldName]) {
    fields[fieldName] = {
      fieldName: DISPLAY_FIELDS[fieldName] || 'autre',
      reputation: 0,
      count: 0,
    };
  }
  fields[fieldName].reputation += reputation;
  fields[fieldName].count++;
  return fields;
}

const WonReputation = ({ navigation, route }) => {
  const [user, setUser] = useRecoilState(userState);
  const { reputation } = route.params;

  useEffect(() => StatusBar.setBarStyle('dark-content'), []);

  const userReputation = user.contributions.reduce(
    (reputation, contribution) => reputation + contribution.reputation,
    0,
  );
  const won = reputation.total;

  const fields = reputation.fields
    ? Object.values(reputation.fields.reduce(groupFields, {}))
    : [];

  const getProfileRequest = getProfile(user.jwt);
  const close = () => {
    getProfileRequest.then(setUser);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <IconButton icon="close" onPress={close} />
      <Card>
        <Card.Content>
          <Title style={styles.title}>
            Bravo ! Vous gagnez des points en aidant la communauté
          </Title>
          <Divider />

          <View style={styles.statistics}>
            <View style={styles.flex}>
              <AnimatedCircle initial={userReputation} won={won} />
            </View>
            <View style={styles.flex}>
              <Text>+ </Text>
              <AnimatedText initial={0} won={won} />
              <Text> point{won > 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={styles.details}>
            {fields.length ? (
              fields.map(({ fieldName, reputation, count }) => (
                <View key={fieldName} style={styles.detailRow}>
                  <Text>
                    {count > 1 ? ` ${count}` : null}
                    {fieldName.replace(/\(s\)/g, () => (count > 1 ? 's' : ''))}
                  </Text>
                  <Text>+{reputation}</Text>
                </View>
              ))
            ) : (
              <View style={styles.detailRow}>
                <Text>{REASONS[reputation.reason]}</Text>
                <Text>+{reputation.total}</Text>
              </View>
            )}
          </View>

          <Divider />
          <Text style={styles.helpText}>
            Gagner des points vous permet d&apos;accéder à de nouvelles
            fonctionnalités de l&apos;application
          </Text>
        </Card.Content>
      </Card>
      <Button onPress={close} mode="contained" style={styles.closeButton}>
        Fermer
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    margin: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  statistics: {
    marginVertical: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  flex: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  helpText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'grey',
  },
  closeButton: {
    marginTop: 20,
  },
});

export default WonReputation;
