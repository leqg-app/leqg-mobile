import 'dart:math';

/// Équivalent de @turf/circle : polygone GeoJSON de [steps] points autour de
/// [center] ([lng, lat]) avec un rayon en kilomètres.
Map<String, dynamic> circlePolygon(List<double> center, double radiusKm,
    {int steps = 64}) {
  final coordinates = <List<double>>[];
  final longitude = center[0];
  final latitude = center[1];

  for (var i = 0; i <= steps; i++) {
    final bearing = i * 360 / steps;
    final bearingRad = bearing * pi / 180;
    final latRad = latitude * pi / 180;
    final lngRad = longitude * pi / 180;
    final distRad = radiusKm / 6371;

    final destLat = asin(sin(latRad) * cos(distRad) +
        cos(latRad) * sin(distRad) * cos(bearingRad));
    final destLng = lngRad +
        atan2(sin(bearingRad) * sin(distRad) * cos(latRad),
            cos(distRad) - sin(latRad) * sin(destLat));

    coordinates.add([destLng * 180 / pi, destLat * 180 / pi]);
  }

  return {
    'type': 'Feature',
    'properties': <String, dynamic>{},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [coordinates],
    },
  };
}
