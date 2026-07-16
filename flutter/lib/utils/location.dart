import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

/// Port de src/utils/location.js : renvoie [longitude, latitude].
/// Lève 'position.denied' / 'position.blocked' comme l'app RN.
Future<List<double>> getLocation({
  int timeout = 2000,
  bool askedByUser = false,
  BuildContext? context,
}) async {
  final serviceEnabled = await Geolocator.isLocationServiceEnabled();
  var permission = await Geolocator.checkPermission();

  if (!askedByUser &&
      permission != LocationPermission.always &&
      permission != LocationPermission.whileInUse) {
    throw permission == LocationPermission.deniedForever
        ? 'position.blocked'
        : 'position.denied';
  }

  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
  }

  if (permission != LocationPermission.always &&
      permission != LocationPermission.whileInUse) {
    if (permission == LocationPermission.deniedForever &&
        askedByUser &&
        context != null &&
        context.mounted) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          content: const Text(
              'La géolocalisation est désactivée pour cette application, vous devez changer ce paramètre dans les réglages. Voulez-vous le faire maintenant ?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Annuler'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                Geolocator.openAppSettings();
              },
              child: const Text('Activer'),
            ),
          ],
        ),
      );
    }
    throw permission == LocationPermission.deniedForever
        ? 'position.blocked'
        : 'position.denied';
  }

  if (!serviceEnabled) {
    throw 'position.denied';
  }

  try {
    final position = await Geolocator.getCurrentPosition(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        timeLimit: Duration(milliseconds: timeout),
      ),
    );
    return [position.longitude, position.latitude];
  } catch (_) {
    final last = await Geolocator.getLastKnownPosition();
    if (last != null) {
      return [last.longitude, last.latitude];
    }
    rethrow;
  }
}
