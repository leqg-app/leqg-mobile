import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/users.dart' as users_api;
import '../models/models.dart';
import '../utils/error_message.dart';
import 'atoms.dart';

/// Port de src/store/hooks.js (useFavoriteState) : mise à jour optimiste
/// des favoris avec retour arrière en cas d'erreur.
class FavoriteActions {
  final Ref ref;
  bool _loading = false;

  FavoriteActions(this.ref);

  Future<String?> addFavorite(Store store) async {
    final user = ref.read(userProvider);
    if (user == null || _loading) {
      return null;
    }
    _loading = true;
    final favorites = [...user.favorites, store.toJson()];
    ref.read(userProvider.notifier).set(user.copyWithFavorites(favorites));
    try {
      await users_api.updateProfile(user.jwt, {
        'favorites': favorites.map((f) => {'id': f['id']}).toList(),
      });
      return null;
    } catch (err) {
      final error = getErrorMessage(err);
      ref.read(userProvider.notifier).set(user.copyWithFavorites(
          user.favorites.where((f) => f['id'] != store.id).toList()));
      return error;
    } finally {
      _loading = false;
    }
  }

  Future<String?> removeFavorite(Store store) async {
    final user = ref.read(userProvider);
    if (user == null || _loading) {
      return null;
    }
    _loading = true;
    final favorites =
        user.favorites.where((f) => f['id'] != store.id).toList();
    ref.read(userProvider.notifier).set(user.copyWithFavorites(favorites));
    try {
      await users_api.updateProfile(user.jwt, {
        'favorites': favorites.map((f) => {'id': f['id']}).toList(),
      });
      return null;
    } catch (err) {
      final error = getErrorMessage(err);
      ref
          .read(userProvider.notifier)
          .set(user.copyWithFavorites([...user.favorites, store.toJson()]));
      return error;
    } finally {
      _loading = false;
    }
  }
}

final favoriteActionsProvider = Provider((ref) => FavoriteActions(ref));
