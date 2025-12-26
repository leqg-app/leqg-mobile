import { Alert, Linking, Platform } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

const errorMessages = {
  denied: 'position.denied',
  blocked: 'position.blocked',
};

async function getLocation(options = {}) {
  const { timeout = 2000, askedByUser = false } = options;

  const permissions = Platform.select({
    ios: [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
    android: [
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ],
  });
  const status = await checkMultiple(permissions);
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });
  if (!askedByUser && status[permission] !== 'granted') {
    throw errorMessages[status[permission]] || status[permission];
  }
  const asked = await requestMultiple(permissions);
  if (asked[permission] !== 'granted') {
    if (status[permission] === 'blocked' && askedByUser) {
      Alert.alert(
        '',
        'La géolocalisation est désactivée pour cette application, vous devez changer ce paramètre dans les réglages. Voulez-vous le faire maintenant ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Activer',
            onPress: () => Linking.openSettings(),
          },
        ],
        { cancelable: true },
      );
    }
    throw errorMessages[asked[permission]] || asked[permission];
  }
  return new Promise((res, rej) => {
    Geolocation.getCurrentPosition(
      ({ coords }) => res([coords.longitude, coords.latitude]),
      error => rej(errorMessages[error] || error),
      {
        timeout,
      },
    );
  });
}

export default getLocation;
