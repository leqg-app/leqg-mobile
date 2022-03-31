import { Platform } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

function getLocation(options = {}) {
  const { timeout = 2000 } = options;
  return new Promise(async (res, rej) => {
    const status = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ]);
    const asked = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });
    if (status[asked] !== 'granted') {
      rej(status[asked]);
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
