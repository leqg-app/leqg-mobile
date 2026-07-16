import 'dart:math';

import '../models/models.dart';

/// Port de src/utils/coordinates.js.
double getCoordinatesDistance(
    {required double latitude1,
    required double longitude1,
    required double latitude2,
    required double longitude2}) {
  final radlat1 = pi * latitude1 / 180;
  final radlat2 = pi * latitude2 / 180;

  final theta = longitude1 - longitude2;
  final radtheta = pi * theta / 180;

  var dist =
      sin(radlat1) * sin(radlat2) + cos(radlat1) * cos(radlat2) * cos(radtheta);

  dist = acos(min(dist, 1));
  dist = dist * 180 / pi;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344; // miles → km

  return dist;
}

bool isStoreInBounds(Store store, MapBounds? bounds) {
  if (bounds == null) {
    return true;
  }
  final ne = bounds.northEast;
  final sw = bounds.southWest;
  return store.longitude >= sw[0] &&
      store.longitude <= ne[0] &&
      store.latitude >= sw[1] &&
      store.latitude <= ne[1];
}
