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
        followUser: true,
        coordinates,
        zoom: 13,
      });
    } catch (e) {
      console.log(e);
      // TODO: toast error
      storage.setObject('mapPosition', {
        followUser: false,
        coordinates: DEFAULT_MAP.CENTER_COORDINATES,
        zoom: DEFAULT_MAP.ZOOM_LEVEL,
      });
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
            <Bullet text="Le code de l'application est ouvert, vous pouvez vérifier par vous-même" />
          </View>
          <View style={styles.actions}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Button
                  style={styles.button}
                  contentStyle={styles.contentButton}
                  mode="contained"
                  color="#305458"
                  icon="navigation"
                  onPress={grant}>
                  Activer
                </Button>
                <Button
                  style={styles.button}
                  contentStyle={styles.contentButton}
                  color="#fff"
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
