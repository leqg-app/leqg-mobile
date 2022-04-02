import { Platform } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

function getLocation(options = {}) {
  const { timeout = 2000, askedByUser = false } = options;
  return new Promise(async (res, rej) => {
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
      rej(status[permission]);
      return;
    }
    const asked = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ]);
    if (asked[permission] !== 'granted') {
      rej(asked[permission]);
      return;
    }
    Geolocation.getCurrentPosition(
      ({ coords }) => res([coords.longitude, coords.latitude]),
      err => rej(err),
      {
        timeout,
      },
    );
  });
}

export default getLocation;
