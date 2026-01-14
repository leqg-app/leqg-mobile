import React, { Suspense } from 'react';
import { Platform, StyleSheet, View, Linking, ScrollView } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import Share from 'react-native-share';
import { useAtomValue, useAtom } from 'jotai';
import { ErrorBoundary } from 'react-error-boundary';
import formatDistance from 'date-fns/formatDistance';
import dateLocale from 'date-fns/locale/fr';
import { useNavigation } from '@react-navigation/native';
import FastImage from '@d11/react-native-fast-image';
import { api as apiEndpoint } from '../../../app.json';

import SchedulesPreview from './SchedulesPreview';
import Schedules from './Schedules';
import { getUrlHost } from '../../utils/url';
import StoreFeatures from './StoreFeatures';
import { storeState, storeQueryRequestIDState } from '../../store/atoms';
import StoreValidate from './StoreValidate';
import { useStoreActions } from '../../store/storeActions';
import StoreActionButtons, { ActionButton } from './StoreActions';
import StoreRates from './StoreRates';

function OfflineMessage({ resetErrorBoundary, error }) {
  if (error?.message?.includes('Internal Server Error')) {
    return (
      <View style={styles.contentCenter}>
        <Text>Une erreur est survenue, merci de réessayer plus tard</Text>
        <IconButton icon="cloud-alert" />
        <Button
          style={styles.offlineRetryButton}
          mode="outlined"
          icon="reload"
          onPress={resetErrorBoundary}
          uppercase={false}>
          Touchez ici pour réessayer
        </Button>
      </View>
    );
  }
  return (
    <View style={styles.contentCenter}>
      <Text>Veuillez vérifier votre connexion internet</Text>
      <IconButton icon="wifi-off" />
      <Button
        style={styles.offlineRetryButton}
        mode="outlined"
        icon="reload"
        onPress={resetErrorBoundary}
        uppercase={false}>
        Touchez ici pour réessayer
      </Button>
    </View>
  );
}

function Loading() {
  return (
    <View style={styles.contentCenter}>
      <ActivityIndicator />
    </View>
  );
}

function UpdatedAt({ date }) {
  if (!date) {
    return <View />;
  }
  const updatedAt = formatDistance(new Date(date), Date.now(), {
    addSuffix: true,
    locale: dateLocale,
  });
  return (
    <Text variant="bodyMedium" style={styles.updateDate}>
      Mis à jour {updatedAt}
    </Text>
  );
}

function StoreEnrichedPhotos({ id }) {
  const store = useAtomValue(storeState(id));
  if (!store.photos || store.photos.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.photosScrollView}
      contentContainerStyle={styles.photosContent}>
      {store.photos.map((photo, index) => (
        <FastImage
          key={photo.id || index}
          source={{ uri: `${apiEndpoint}${photo.url}` || photo }}
          style={styles.photo}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
}

function ListInfo({ onPress, content, icon, chevron = true }) {
  return (
    <TouchableRipple onPress={onPress} rippleColor="rgba(0, 0, 0, .25)">
      <View style={styles.row}>
        <View style={styles.infoRow}>
          <List.Icon style={styles.infoIcon} size={40} icon={icon} />
          <Text style={styles.infoText}>{content}</Text>
        </View>
        {chevron && <List.Icon icon="chevron-right" style={styles.chevron} />}
      </View>
    </TouchableRipple>
  );
}

function openAddress(store) {
  const { name, latitude, longitude, address } = store;
  const encodedName = encodeURIComponent(name);
  const encodedAddress = encodeURIComponent(address);
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedName}@${latitude},${longitude}`,
    android: `https://www.google.com/maps/search/${encodedName},+${encodedAddress}?hl=fr`,
  });
  Linking.openURL(url);
}

export function shareStore(store) {
  Share.open({
    title: 'Retrouvons nous',
    message: `Retrouvons nous au ${store.name}\n\n${store.address}`,
  }).catch(() => {});
}

function call(store) {
  if (store?.phone) {
    Linking.openURL(`tel:${store.phone}`);
  }
}

function StoreContent({ id }) {
  const navigation = useNavigation();
  const { editStoreScreen } = useStoreActions();
  const store = useAtomValue(storeState(id));

  return (
    <>
      <Button onPress={() => editStoreScreen(store)} icon="pencil" mode="text">
        Suggérer une modification
      </Button>
      <Card elevation={1} mode="outlined" style={styles.card}>
        <ListInfo
          onPress={() =>
            navigation.navigate('StoreProductsScreen', {
              screen: 'StoreProductsList',
              params: { storeId: id },
            })
          }
          content="Voir la carte"
          icon="beer"
        />
      </Card>
      {(store.website || store.phone) && (
        <Card elevation={1} mode="outlined" style={styles.card}>
          {store.website && (
            <View>
              <Divider />
              <ListInfo
                onPress={() => Linking.openURL(store.website)}
                content={getUrlHost(store.website)}
                icon="earth"
              />
            </View>
          )}
          {store.phone && (
            <View>
              <Divider />
              <ListInfo
                onPress={() => call(store)}
                content={store.phone}
                icon="phone"
              />
            </View>
          )}
        </Card>
      )}
      {store.features?.length ? (
        <>
          <Text style={styles.title}>Caractéristiques</Text>
          <View style={styles.features}>
            <StoreFeatures features={store.features} />
          </View>
        </>
      ) : null}
      <Text style={styles.title}>Avis</Text>
      <StoreRates store={store} />
      {store.updatedAt && <UpdatedAt date={store.updatedAt} />}
    </>
  );
}

const Store = ({ sheetStore }) => {
  const { colors } = useTheme();
  const [requestId, setRequestID] = useAtom(storeQueryRequestIDState);

  const [expandSchedules, setExpandSchedules] = React.useState(false);
  const refreshStore = () => setRequestID(requestId => requestId + 1);

  if (!sheetStore) {
    return <View />;
  }

  return (
    <>
      <View style={styles.actionsBar}>
        <ActionButton
          onPress={() => openAddress(sheetStore)}
          name="Itinéraire"
          icon="directions"
          color={colors.onPrimary}
        />
        <ActionButton
          onPress={() => shareStore(sheetStore)}
          name="Partager"
          icon="share-variant"
          color={colors.onPrimary}
        />
        <ErrorBoundary fallback={<></>} resetKeys={[requestId]}>
          <Suspense fallback={<></>}>
            <StoreActionButtons id={sheetStore.id} />
          </Suspense>
        </ErrorBoundary>
      </View>
      <ErrorBoundary fallback={<></>} resetKeys={[requestId]}>
        <Suspense fallback={<></>}>
          <StoreEnrichedPhotos id={sheetStore.id} />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary fallback={<></>} resetKeys={[requestId]}>
        <Suspense fallback={<></>}>
          <StoreValidate id={sheetStore.id} />
        </Suspense>
      </ErrorBoundary>
      <Card elevation={1} mode="outlined" style={styles.card}>
        <ListInfo
          onPress={() => openAddress(sheetStore)}
          content={sheetStore.address}
          icon="map-marker"
        />
        <Divider />
        <TouchableRipple
          onPress={() => setExpandSchedules(!expandSchedules)}
          rippleColor="rgba(0, 0, 0, .25)">
          <View style={styles.row}>
            {!expandSchedules ? (
              <View style={styles.infoRow}>
                <List.Icon style={styles.infoIcon} size={40} icon="clock" />
                <SchedulesPreview schedules={sheetStore.schedules} />
              </View>
            ) : (
              <View style={styles.schedulesWrapper}>
                <Schedules schedules={sheetStore.schedules} />
              </View>
            )}
            {!expandSchedules && (
              <List.Icon icon="chevron-down" style={styles.chevron} />
            )}
          </View>
        </TouchableRipple>
      </Card>
      <ErrorBoundary FallbackComponent={OfflineMessage} onReset={refreshStore}>
        <Suspense fallback={<Loading />}>
          <StoreContent id={sheetStore.id} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

const styles = StyleSheet.create({
  actionsBar: {
    marginHorizontal: 30,
    marginVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  infoIcon: {
    marginHorizontal: 10,
    backgroundColor: 'transparent',
  },
  infoText: {
    flex: 1,
  },
  infoTextItalic: {
    fontStyle: 'italic',
  },
  chevron: {
    width: 30,
    marginRight: 10,
  },
  schedulesWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  features: {
    marginHorizontal: 15,
  },
  contentCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    height: 300,
  },
  offlineRetryButton: {
    marginTop: 30,
  },
  updateDate: {
    marginTop: 10,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  photosScrollView: {
    marginVertical: 10,
    height: 100,
  },
  photosContent: {
    paddingHorizontal: 15,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default Store;
