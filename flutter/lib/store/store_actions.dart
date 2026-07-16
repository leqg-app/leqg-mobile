import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/stores.dart' as stores_api;
import '../models/models.dart';
import '../utils/format_store.dart';
import 'atoms.dart';
import 'database.dart';
import 'storage.dart';

/// Port de src/store/storeActions.js (saveStore).
class SaveStoreResult {
  final Object? error;
  final Store? store;
  final Map<String, dynamic>? reputation;

  const SaveStoreResult({this.error, this.store, this.reputation});
}

class StoreActions {
  final Ref ref;

  StoreActions(this.ref);

  /// Met à jour le sheet et le store détaillé (≙ updateStoreAtom).
  void _updateStoreState(int id, Store store) {
    ref.read(sheetStoreProvider.notifier).state = store;
    ref.read(storeDetailProvider(id).notifier).set(store);
  }

  Future<SaveStoreResult> saveStore(StoreEdition storeEdition) async {
    final user = ref.read(userProvider);
    try {
      Map<String, dynamic> response;
      if (storeEdition.id != null) {
        response = await stores_api.editStore(
            storeEdition.id!, storeEdition.toJson(), user!.jwt);
      } else {
        response =
            await stores_api.addStore(storeEdition.toJson(), user!.jwt);
      }

      final versions = Storage.getObject<Map<String, dynamic>>('versions', {})!;
      final responseStore =
          (response['store'] as Map).cast<String, dynamic>();
      final store = storeToDatabase(responseStore);

      if (versions['stores'] is num &&
          (versions['stores'] as num) + 1 == response['version']) {
        StoreDatabase.setStore(store);
        ref.read(storesRawProvider.notifier).update((stores) {
          if (storeEdition.id == null) {
            return [...stores, store];
          }
          return [
            ...stores.where((s) => s.id != storeEdition.id),
            store,
          ];
        });
      } else {
        // D'autres changements ont eu lieu entre-temps : tout récupérer
        final versioned = await stores_api.getStoresVersion(
            versions['stores'], response['version']);

        if (versioned is Map &&
            (versioned['updated'] != null || versioned['deleted'] != null)) {
          final updated = (versioned['updated'] as List?) ?? const [];
          final deleted = (versioned['deleted'] as List?) ?? const [];
          final updatedIds =
              updated.map((u) => ((u as List)[0] as num).toInt()).toSet();
          final deletedIds = deleted.map((id) => (id as num).toInt()).toSet();
          ref.read(storesRawProvider.notifier).update((stores) {
            return [
              ...stores.where((s) =>
                  !updatedIds.contains(s.id) && !deletedIds.contains(s.id)),
              ...updated.map(storesToDatabase).whereType<Store>(),
            ];
          });
        }
      }

      _updateStoreState(store.id, Store.fromJson(responseStore));

      Storage.setObject('versions', {
        ...versions,
        'stores': response['version'],
      });

      return SaveStoreResult(
        store: store,
        reputation:
            (response['reputation'] as Map?)?.cast<String, dynamic>(),
      );
    } catch (error) {
      return SaveStoreResult(error: error);
    }
  }
}

final storeActionsProvider = Provider((ref) => StoreActions(ref));
