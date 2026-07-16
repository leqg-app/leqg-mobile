import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants.dart';
import '../../routes.dart';
import '../../store/storage.dart';
import '../../theme.dart';
import '../../utils/location.dart';

/// Port de src/containers/Intro/LocationPermission.js.
class LocationPermissionScreen extends ConsumerStatefulWidget {
  const LocationPermissionScreen({super.key});

  @override
  ConsumerState<LocationPermissionScreen> createState() =>
      _LocationPermissionScreenState();
}

class _LocationPermissionScreenState
    extends ConsumerState<LocationPermissionScreen> {
  bool loading = false;

  void _next() {
    Storage.set('firstOpen', true);
    ref.read(firstOpenProvider.notifier).state = true;
  }

  Future<void> _grant() async {
    setState(() => loading = true);
    try {
      final coordinates =
          await getLocation(askedByUser: true, context: context);
      Storage.setObject('mapPosition', {
        'coordinates': coordinates,
        'zoom': 13,
      });
    } catch (_) {
      Storage.setObject('mapPosition', {
        'coordinates': DefaultMap.centerCoordinates,
        'zoom': DefaultMap.zoomLevel,
      });
    } finally {
      setState(() => loading = false);
    }
    _next();
  }

  @override
  Widget build(BuildContext context) {
    final primary = lightColorScheme.primary;

    Widget bullet(String text) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(right: 15),
                child: Icon(Icons.arrow_right_alt, color: Colors.white),
              ),
              Expanded(
                child:
                    Text(text, style: const TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );

    return Scaffold(
      backgroundColor: primary,
      body: SafeArea(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: MediaQuery.of(context).size.height -
                  MediaQuery.of(context).padding.vertical,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(top: 20),
                    child: Text(
                      'Activer la géolocalisation ?',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 30),
                    child: Column(
                      children: [
                        bullet(
                            'Elle permet de facilement vous repérer sur la carte'),
                        bullet(
                            "Nous n'envoyons jamais votre position à nos serveurs"),
                        bullet(
                            "Le code de l'application est ouvert à tous"),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 110,
                    child: loading
                        ? const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            ),
                          )
                        : Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              crossAxisAlignment:
                                  CrossAxisAlignment.stretch,
                              children: [
                                ElevatedButton.icon(
                                  onPressed: _grant,
                                  icon: const Icon(Icons.navigation),
                                  label: const Text('Activer'),
                                ),
                                TextButton(
                                  onPressed: _next,
                                  child: const Text('Ignorer',
                                      style:
                                          TextStyle(color: Colors.white)),
                                ),
                              ],
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
