import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'containers/intro/intro.dart';
import 'store/entities_actions.dart';
import 'store/storage.dart';
import 'tabs.dart';

/// Port de src/Routes.js : intro au premier lancement, sinon les onglets ;
/// chargement des entités au démarrage.
final firstOpenProvider = StateProvider<bool>((ref) {
  final stored = Storage.getBool('firstOpen');
  if (kDebugMode && stored == null) {
    // Comme l'app RN : pas d'intro en dev
    Storage.set('firstOpen', true);
    return true;
  }
  return stored ?? false;
});

class Routes extends ConsumerStatefulWidget {
  const Routes({super.key});

  @override
  ConsumerState<Routes> createState() => _RoutesState();
}

class _RoutesState extends ConsumerState<Routes> {
  bool loadedEntities = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (loadedEntities) {
        return;
      }
      loadedEntities = true;
      ref.read(entitiesActionsProvider).loadEntities();
    });
  }

  @override
  Widget build(BuildContext context) {
    final firstOpen = ref.watch(firstOpenProvider);
    final shouldShowIntro = !firstOpen;

    if (shouldShowIntro) {
      return const IntroStack();
    }
    return const TabNavigator();
  }
}
