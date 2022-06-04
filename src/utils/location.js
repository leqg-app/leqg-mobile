import { Platform } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

async function getLocation(options = {}) {
  const { timeout = 2000, askedByUser = false } = options;
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });
  const status = await checkMultiple([
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  ]);
  if (!askedByUser && status[permission] !== 'granted') {
    throw status[permission];
  }
  const asked = await requestMultiple([
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  ]);
  if (asked[permission] !== 'granted') {
    throw asked[permission];
  }
  return new Promise((res, rej) => {
    Geolocation.getCurrentPosition(
      ({ coords }) => res([coords.longitude, coords.latitude]),
      error => rej(error),
      {
        timeout,
      },
    );
  });
}

export default getLocation;
