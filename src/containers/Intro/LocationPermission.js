import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, List, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_MAP, theme } from '../../constants';
import { storage } from '../../store/storage';
import getLocation from '../../utils/location';

function Bullet({ text }) {
  return (
    <List.Item
      titleStyle={styles.noHeight}
      descriptionStyle={{ color: '#fff' }}
      description={text}
      left={() => <List.Icon color="#fff" icon="arrow-right-bold" />}
    />
  );
}

function LocationPermission() {
  const [loading, setLoading] = useState();

  const next = () => storage.set('firstOpen', true);

  const grant = async () => {
    setLoading(true);
    try {
      const coordinates = await getLocation({ askedByUser: true });
      storage.setObject('mapPosition', {
        coordinates,
        zoom: 13,
      });
    } catch (e) {
      storage.setObject('mapPosition', {
        coordinates: DEFAULT_MAP.CENTER_COORDINATES,
        zoom: DEFAULT_MAP.ZOOM_LEVEL,
      });
    } finally {
      setLoading(false);
    }
    next();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.padded}>
          <Title style={styles.title}>Activer la géolocalisation ?</Title>
          <View style={styles.explanation}>
            <Bullet text="Elle permet de facilement vous repérer sur la carte" />
            <Bullet text="Nous n'envoyons jamais votre position à nos serveurs" />
            <Bullet text="Le code de l'application est ouvert à tous" />
          </View>
          <View style={styles.actions}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Button
                  contentStyle={styles.contentButton}
                  mode="elevated"
                  textColor="#305458"
                  icon="navigation"
                  onPress={grant}>
                  Activer
                </Button>
                <Button
                  contentStyle={styles.contentButton}
                  textColor="#fff"
                  onPress={next}>
                  Ignorer
                </Button>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  padded: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  explanation: {
    color: '#fff',
    marginVertical: 30,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    height: 110,
    marginHorizontal: 20,
  },
  contentButton: {
    height: 50,
  },
  noHeight: {
    height: 0,
  },
});

export default LocationPermission;
