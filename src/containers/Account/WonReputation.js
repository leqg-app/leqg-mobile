import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Title, IconButton, Card, Divider, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedCircle from '../../components/AnimatedCircle';
import AnimatedText from '../../components/AnimatedText';
import { useStore } from '../../store/context';

const DISPLAY_FIELDS = {
  name: 'Nom',
  address: 'Adresse',
  website: 'Site internet',
  phone: 'Téléphone',
  products: 'Produit',
  schedules: 'Horaire',
  features: 'Caractéristique',
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
  const [state] = useStore();
  const { reputation } = route.params;

  useEffect(() => StatusBar.setBarStyle('dark-content'), []);

  const initial = state.user.reputation;
  const won = reputation.total;

  const fields = Object.values(reputation.fields.reduce(groupFields, {}));
  const close = () => navigation.goBack();

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
              <AnimatedCircle initial={initial} won={won} />
            </View>
            <View style={styles.flex}>
              <Text>+ </Text>
              <AnimatedText initial={0} won={won} />
              <Text> point{won > 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={styles.details}>
            {fields.map(({ fieldName, reputation, count }) => (
              <View key={fieldName} style={styles.detailRow}>
                <Text>
                  {count} {fieldName}
                  {count > 1 ? 's' : ''}
                </Text>
                <Text>+{reputation}</Text>
              </View>
            ))}
          </View>

          <Divider />
          <Text style={styles.helpText}>
            Gagner des points vous permet d'accéder à de nouvelles
            fonctionnalités de l'application
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
