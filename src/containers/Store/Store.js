import React, { useMemo, Suspense } from 'react';
import { Alert, Platform, StyleSheet, Text, View, Linking } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Caption,
  Divider,
  IconButton,
  List,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import Share from 'react-native-share';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigation } from '@react-navigation/native';

import StoreProducts from './StoreProducts';
import SchedulesPreview from './SchedulesPreview';
import Schedules from './Schedules';
import { theme } from '../../constants';
import { getUrlHost } from '../../utils/url';
import StoreFeatures from './StoreFeatures';
import {
  sheetStoreState,
  storeState,
  userState,
  storeQueryRequestIDState,
} from '../../store/atoms';
import { useFavoriteState } from '../../store/hooks';
import StoreValidate from './StoreValidate';
import { useStoreActions } from '../../store/storeActions';

function OfflineMessage({ resetErrorBoundary }) {
  return (
    <View style={styles.contentCenter}>
      <Text style={styles.offlineMessage}>
        Veuillez vérifier votre connexion internet
      </Text>
      <IconButton icon="wifi-off" color="#888" />
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
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

function ActionButton({ name, icon, onPress, color = 'white' }) {
  return (
    <View>
      <TouchableRipple
        style={styles.actionRipple}
        borderless
        centered
        onPress={onPress}
        rippleColor="rgba(0, 0, 0, .25)">
        <Avatar.Icon
          style={styles.action}
          size={45}
          icon={icon}
          color={color}
        />
      </TouchableRipple>
      <Caption style={styles.actionCaption}>{name}</Caption>
    </View>
  );
}

function ListInfo({ onPress, content, icon, chevron = true }) {
  return (
    <TouchableRipple onPress={onPress} rippleColor="rgba(0, 0, 0, .25)">
      <View style={styles.row}>
        <View style={styles.infoRow}>
          <List.Icon
            style={styles.infoIcon}
            size={40}
            icon={icon}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>{content}</Text>
        </View>
        {chevron && (
          <List.Icon icon="chevron-right" color="grey" style={styles.chevron} />
        )}
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

function StoreActionButtons({ id }) {
  const store = useRecoilValue(storeState(id));
  const user = useRecoilValue(userState);
  const setSheetStore = useSetRecoilState(sheetStoreState);
  const navigation = useNavigation();
  const { addFavorite, removeFavorite } = useFavoriteState();

  const isFavorite = useMemo(() => {
    if (!user) {
      return;
    }
    const { favorites = [] } = user;
    return favorites.some(favorite => favorite.id === store.id);
  }, [user]);

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        '',
        'Vous devez être connecté pour enregistrer ce bar dans vos favoris',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Connexion',
            onPress: () => {
              navigation.navigate('AccountTab');
              setSheetStore();
            },
          },
        ],
        { cancelable: true },
      );
      return;
    }
    if (isFavorite) {
      removeFavorite(store);
    } else {
      addFavorite(store);
    }
  };

  return (
    <>
      <ActionButton
        onPress={toggleFavorite}
        name="Enregistrer"
        color={isFavorite ? 'gold' : 'white'}
        icon={isFavorite ? 'star' : 'star-outline'}
        disabled
      />
      {store.phone && (
        <ActionButton onPress={() => call(store)} name="Appeler" icon="phone" />
      )}
    </>
  );
}

function StoreContent({ id }) {
  const { editStoreScreen } = useStoreActions();
  const store = useRecoilValue(storeState(id));

  return (
    <>
      {store.products && (
        <>
          <ListInfo
            onPress={() => editStoreScreen(store)}
            content={
              <Text style={styles.infoTextItalic}>
                Suggérer une modification
              </Text>
            }
            icon="pencil"
            chevron={false}
          />
          <Divider />
          <StoreProducts products={store.products} />
        </>
      )}
      {store.website && (
        <>
          <ListInfo
            onPress={() => Linking.openURL(store.website)}
            content={getUrlHost(store.website)}
            icon="earth"
          />
          <Divider />
        </>
      )}
      {store.phone && (
        <>
          <ListInfo
            onPress={() => call(store)}
            content={store.phone}
            icon="phone"
          />
          <Divider />
        </>
      )}
      {store.features?.length ? (
        <>
          <Text style={styles.title}>Caractéristiques</Text>
          <View style={styles.features}>
            <StoreFeatures features={store.features} />
          </View>
        </>
      ) : null}
    </>
  );
}

const Store = () => {
  const { colors } = useTheme();
  const sheetStore = useRecoilValue(sheetStoreState);
  const [requestId, setRequestID] = useRecoilState(storeQueryRequestIDState);

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
        />
        <ActionButton
          onPress={() => shareStore(sheetStore)}
          name="Partager"
          icon="share-variant"
        />
        <ErrorBoundary fallback={<></>} resetKeys={[requestId]}>
          <Suspense fallback={<></>}>
            <StoreActionButtons id={sheetStore.id} />
          </Suspense>
        </ErrorBoundary>
      </View>
      <ErrorBoundary fallback={<></>} resetKeys={[requestId]}>
        <Suspense fallback={<></>}>
          <StoreValidate id={sheetStore.id} />
        </Suspense>
      </ErrorBoundary>
      <Divider />
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
              <List.Icon
                style={styles.infoIcon}
                size={40}
                icon="clock"
                color={colors.primary}
              />
              <SchedulesPreview schedules={sheetStore.schedules} />
            </View>
          ) : (
            <View style={styles.schedulesWrapper}>
              <Schedules schedules={sheetStore.schedules} />
            </View>
          )}
          {!expandSchedules && (
            <List.Icon
              icon="chevron-down"
              color="grey"
              style={styles.chevron}
            />
          )}
        </View>
      </TouchableRipple>
      <Divider />
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
  actionRipple: {
    width: 60,
    height: 60,
    borderRadius: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCaption: {
    textAlign: 'center',
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
  offlineMessage: {
    color: '#888',
  },
  offlineRetryButton: {
    marginTop: 30,
    color: '#fff',
  },
});

export default Store;
