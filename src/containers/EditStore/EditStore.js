import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';

import Menu from '../../components/Menu';
import EditSchedules, { newSchedule } from './EditSchedules';
import EditAddress from './EditAddress';
import History from './History';
import Schedules from '../Store/Schedules';
import StoreFeatures from '../Store/StoreFeatures';
import EditFeatures from './EditFeatures';
import AddPhoto from './AddPhoto';
import {
  sheetStoreState,
  storeEditionState,
  userState,
} from '../../store/atoms';
import { useStoreActions } from '../../store/storeActions';
import { getErrorMessage } from '../../utils/errorMessage';

const EditStore = ({ route, navigation }) => {
  const nameInput = useRef();
  const [state, setState] = useState({ error: false, loading: false });
  const user = useAtomValue(userState);
  const setSheetStore = useSetAtom(sheetStoreState);
  const [storeEdition, setStoreEdition] = useAtom(storeEditionState);
  const { saveStore } = useStoreActions();

  const {
    name = '',
    address,
    longitude,
    latitude,
    schedules = new Array(7).fill(0).map(newSchedule),
    features = [],
  } = storeEdition;

  const validAddress = address && longitude && latitude;
  const validForm = name && validAddress && user;

  const save = async () => {
    setState({ loading: true });
    if (!validForm) {
      return setState({ error: 'Certains champs sont manquants' });
    }
    if (!storeEdition.products?.length) {
      return setState({
        loading: false,
        error: 'Veuillez ajouter au moins une bière à la carte',
      });
    }
    const { error, store, reputation } = await saveStore(storeEdition);
    if (error) {
      return setState({ error: getErrorMessage(error) });
    }
    if (!storeEdition.id) {
      setSheetStore({ ...store, focus: true });
    }
    if (reputation.total) {
      navigation.replace('WonReputation', { reputation });
    } else {
      navigation.navigate('TabNavigator', {
        screen: 'MapTab',
        params: {
          screen: 'MapScreen',
          params: { contribute: true },
        },
      });
    }
  };

  useEffect(() => {
    setState({ loading: false });
    if (route.params?.store && !route.params.store.name && nameInput.current) {
      nameInput.current.focus();
    }
    return navigation.addListener('beforeRemove', function () {
      // TODO: confirmation if data was edited
    });
  }, [route.params]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Appbar.BackAction onPress={navigation.goBack} />,
      headerRight: () => (
        <Appbar.Action
          icon="check"
          disabled={!validForm || state.loading}
          onPress={save}
        />
      ),
    });
  }, [validForm, state.loading, save]);

  if (state.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View>
            <ActivityIndicator />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View>
            <Text variant="bodyMedium">
              Veuillez vous connecter pour contribuer
            </Text>
            <Button
              onPress={() => {
                setSheetStore();
                navigation.navigate('TabNavigator', {
                  screen: 'AccountTab',
                });
              }}>
              Connexion
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      {storeEdition?.revisions?.length ? (
        <Menu>
          <Menu.Item
            name="Voir l'historique des modifications"
            icon="clock-outline"
            onPress={() =>
              navigation.navigate('History', { store: storeEdition })
            }
            last
          />
        </Menu>
      ) : null}
      <View style={styles.scrollView}>
        <TextInput
          ref={nameInput}
          style={styles.fieldName}
          label="Nom"
          mode="outlined"
          textContentType="name"
          onChangeText={name => setStoreEdition({ ...storeEdition, name })}
          value={name}
          returnKeyType="done"
        />

        <Card style={styles.card} mode="outlined">
          <Card.Title titleStyle={styles.title} title="Adresse">
            Adresse
          </Card.Title>
          <Card.Content>
            <Text>
              {validAddress
                ? address
                : 'Aucune adresse renseignée pour le moment'}
            </Text>
            <Button
              mode="outlined"
              uppercase={false}
              onPress={() => navigation.navigate('EditAddress')}
              style={styles.addButton}>
              {validAddress ? 'Modifier' : 'Préciser'} l&apos;adresse
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="outlined">
          <Card.Title titleStyle={styles.title} title="Carte des bières" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {storeEdition.id
                ? `${storeEdition.products?.length || 0} bière(s) ajoutée(s)`
                : 'La carte sera modifiable après avoir créé le bar'}
            </Text>
            <Button
              mode="outlined"
              uppercase={false}
              disabled={!storeEdition.id}
              onPress={() => {
                navigation.navigate('StoreProductsScreen', {
                  screen: 'StoreProductsList',
                  params: { storeId: storeEdition.id, editMode: true },
                });
              }}
              style={styles.addButton}>
              Modifier le menu
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="outlined">
          <Card.Title titleStyle={styles.title} title="Horaires" />
          <Card.Content>
            {!schedules.length ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                Aucun horaire renseigné pour le moment
              </Text>
            ) : (
              <Pressable
                style={styles.schedules}
                onPress={() => navigation.navigate('EditSchedules')}>
                <Schedules schedules={schedules} />
              </Pressable>
            )}
            <Button
              mode="outlined"
              uppercase={false}
              onPress={() => navigation.navigate('EditSchedules')}>
              Modifier les horaires
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="outlined">
          <Card.Title titleStyle={styles.title} title="Caractéristiques" />
          <Card.Content>
            {!features.length ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                Aucune caractéristique pour le moment
              </Text>
            ) : (
              <Pressable onPress={() => navigation.navigate('EditFeatures')}>
                <StoreFeatures features={features} />
              </Pressable>
            )}
            <Button
              mode="outlined"
              uppercase={false}
              onPress={() => navigation.navigate('EditFeatures')}>
              Modifier les caractéristiques
            </Button>
          </Card.Content>
        </Card>

        {storeEdition.id && (
          <Card style={styles.card} mode="outlined">
            <Card.Title titleStyle={styles.title} title="Photos" />
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Ajoutez des photos pour illustrer ce bar
              </Text>
              <Button
                mode="outlined"
                uppercase={false}
                icon="camera"
                onPress={() => navigation.navigate('AddPhoto')}
                style={styles.addButton}>
                Ajouter une photo
              </Button>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card} mode="outlined">
          <Card.Title titleStyle={styles.title} title="Autres informations" />
          <Card.Content>
            <TextInput
              style={styles.fieldName}
              label="Téléphone"
              mode="flat"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              onChangeText={phone =>
                setStoreEdition({ ...storeEdition, phone })
              }
              value={storeEdition.phone}
              returnKeyType="done"
            />
            <TextInput
              style={styles.fieldName}
              label="Site internet"
              mode="flat"
              keyboardType="url"
              textContentType="URL"
              onChangeText={website =>
                setStoreEdition({ ...storeEdition, website })
              }
              value={storeEdition.website}
              returnKeyType="done"
            />
          </Card.Content>
        </Card>
      </View>
      <Portal>
        <Snackbar
          visible={state.error}
          duration={3000}
          action={{
            label: 'OK',
          }}
          onDismiss={() => setState({ error: false })}>
          {state.error}
        </Snackbar>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldName: {
    backgroundColor: 'transparent',
    marginTop: 10,
    marginHorizontal: 10,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100,
  },
  card: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  title: { fontSize: 18 },
  schedules: {
    marginBottom: 10,
  },
  addButton: { marginTop: 20, zIndex: 0, position: 'relative' },
  emptyText: {
    marginBottom: 15,
  },
});

const AddStack = createNativeStackNavigator();

export default () => (
  <AddStack.Navigator>
    <AddStack.Screen
      options={({ route }) => ({
        title: route.params?.store?.id ? 'Modifier un bar' : 'Ajouter un bar',
      })}
      name="EditStore"
      component={EditStore}
    />
    <AddStack.Screen
      options={{ title: "Modifier l'adresse" }}
      name="EditAddress"
      component={EditAddress}
    />
    <AddStack.Screen
      options={{ title: 'Modifier les horaires' }}
      name="EditSchedules"
      component={EditSchedules}
    />
    <AddStack.Screen
      options={{ title: 'Modifier les caractéristiques' }}
      name="EditFeatures"
      component={EditFeatures}
    />
    <AddStack.Screen
      options={{ title: 'Ajouter une photo' }}
      name="AddPhoto"
      component={AddPhoto}
    />
    <AddStack.Screen
      options={{ title: 'Historique' }}
      name="History"
      component={History}
    />
  </AddStack.Navigator>
);
