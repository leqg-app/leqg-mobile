import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/entities.dart' as entities_api;
import '../api/stores.dart' as stores_api;
import '../api/users.dart' as users_api;
import '../constants.dart';
import '../models/models.dart';
import '../utils/format_store.dart';
import '../utils/log_error.dart';
import 'atoms.dart';
import 'database.dart';
import 'storage.dart';

/// Port de src/store/entitiesActions.js : synchronisation incrémentale par
/// versions des bars et des entités globales.
class EntitiesActions {
  final Ref ref;

  EntitiesActions(this.ref);

  // -- Chargement des bars

  Future<void> loadStores() async {
    final dbStores = await StoreDatabase.getStores();
    ref.read(storesRawProvider.notifier).set(dbStores);
    final apiVersions = await stores_api.getVersion();
    final localVersions =
        Storage.getObject<Map<String, dynamic>>('versions', {})!;
    final storedAppVersion = Storage.getString('appVersion');

    // Pas d'internet : on s'arrête là
    if (apiVersions['stores'] == null) {
      return;
    }

    final needReset = apiVersions['reset'] != localVersions['reset'] ||
        (apiVersions['stores'] == localVersions['stores'] &&
            (apiVersions['count']?['stores'] != dbStores.length)) ||
        storedAppVersion != appVersion;

    if (!needReset && localVersions['stores'] == apiVersions['stores']) {
      return;
    }

    if (needReset || localVersions['stores'] == null || dbStores.isEmpty) {
      // Tout recharger
      final stores = await stores_api.getStores(apiVersions['stores']);
      final readableStores =
          stores.map(storesToDatabase).whereType<Store>().toList();
      StoreDatabase.setStores(readableStores);
      ref.read(storesRawProvider.notifier).set(readableStores);
    } else {
      // Charger uniquement les bars modifiés
      final versioned = await stores_api.getStoresVersion(
          localVersions['stores'], apiVersions['stores']);

      if (versioned is Map &&
          (versioned['updated'] != null || versioned['deleted'] != null)) {
        final updated = (versioned['updated'] as List?) ?? const [];
        final deleted = (versioned['deleted'] as List?) ?? const [];
        final updatedIds =
            updated.map((u) => ((u as List)[0] as num).toInt()).toSet();
        final deletedIds = deleted.map((id) => (id as num).toInt()).toSet();
        final readableStores = dbStores
            .where((store) =>
                !updatedIds.contains(store.id) && !deletedIds.contains(store.id))
            .toList()
          ..addAll(updated.map(storesToDatabase).whereType<Store>());
        ref.read(storesRawProvider.notifier).set(readableStores);
      } else {
        logError('unexpected versioned response', null, {
          'context': 'loadStores - versioned stores update',
          'localVersions': localVersions,
          'apiVersions': apiVersions,
        });
      }
    }

    Storage.set('appVersion', appVersion);
    Storage.setObject('versions', {
      ...localVersions,
      'stores': apiVersions['stores'],
    });
  }

  // -- Chargement des autres entités

  Future<List<dynamic>?> loadEntity(
    String name,
    Future<List<dynamic>> Function(dynamic version) getEntity,
    void Function(List<dynamic>)? setEntity,
  ) async {
    final apiVersions = await stores_api.getVersion();
    final storedAppVersion = Storage.getString('appVersion');
    final localVersions =
        Storage.getObject<Map<String, dynamic>>('versions', {})!;

    // Pas d'internet : on s'arrête là
    if (apiVersions[name] == null) {
      return null;
    }

    final needReset = apiVersions['reset'] != localVersions['reset'] ||
        storedAppVersion != appVersion;

    if (!needReset && localVersions[name] == apiVersions[name]) {
      return null;
    }

    List<dynamic>? loaded;
    try {
      loaded = await getEntity(apiVersions[name]);
    } catch (_) {
      return null;
    }
    if (setEntity != null) {
      setEntity(loaded);
    }
    Storage.setObject(name, loaded);
    Storage.setObject('versions', {
      ...localVersions,
      name: apiVersions[name],
    });
    return loaded;
  }

  Future<void> loadUser() async {
    final userStored = Storage.getObject<Map<String, dynamic>>('user');
    if (userStored == null) {
      return;
    }
    try {
      final user = await users_api.getProfile((userStored['jwt'] ?? '') as String);
      ref.read(userProvider.notifier).set(User(user));
    } catch (_) {
      ref.read(userProvider.notifier).set(null);
    }
  }

  Future<void> loadEntities() async {
    ref.read(storeLoadingProvider.notifier).state = true;
    try {
      await loadStores();
    } finally {
      ref.read(storeLoadingProvider.notifier).state = false;
    }

    loadUser();

    await Future.wait([
      loadEntity('products', entities_api.getProducts, (loaded) {
        ref.read(productsProvider.notifier).set(loaded
            .map((p) => Product.fromJson((p as Map).cast<String, dynamic>()))
            .toList());
      }),
      loadEntity('rates', entities_api.getRates, (loaded) {
        ref.read(ratesProvider.notifier).set(loaded
            .map((r) =>
                CurrencyRate.fromJson((r as Map).cast<String, dynamic>()))
            .toList());
      }),
      loadEntity('features', entities_api.getFeatures, (loaded) {
        ref.read(featuresProvider.notifier).set(loaded
            .map((f) =>
                FeatureGroup.fromJson((f as Map).cast<String, dynamic>()))
            .toList());
      }),
    ]);

    final apiVersions = await stores_api.getVersion();
    final localVersions =
        Storage.getObject<Map<String, dynamic>>('versions', {})!;

    if (apiVersions['reset'] != localVersions['reset']) {
      Storage.setObject('versions', {
        ...localVersions,
        'reset': apiVersions['reset'],
      });
    }
  }
}

final entitiesActionsProvider = Provider((ref) => EntitiesActions(ref));
