import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/title.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../store/favorites.dart';
import '../../tabs.dart';

/// Port de src/containers/Favorites/Favorites.js.
class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final stores = ref.watch(storesProvider);
    final colors = Theme.of(context).colorScheme;

    void navigate(Map<String, dynamic> favorite) {
      Store? selectedStore;
      for (final store in stores) {
        if (store.id == favorite['id']) {
          selectedStore = store;
          break;
        }
      }
      if (selectedStore == null) {
        return;
      }
      ref.read(sheetStoreProvider.notifier).state =
          selectedStore.copyWith(focus: true);
      navigateToMapTab(context, ref);
    }

    final favorites = user?.favorites ?? const [];

    if (user == null || favorites.isEmpty) {
      return SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const ScreenTitle('Enregistrés'),
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: user == null
                      ? Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              'Veuillez vous connecter pour voir vos bars favoris',
                              textAlign: TextAlign.center,
                            ),
                            TextButton(
                              onPressed: () =>
                                  navigateToAccountTab(context, ref),
                              child: const Text('Connexion'),
                            ),
                          ],
                        )
                      : const Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              "Vous n'avez pas encore de bar favoris.",
                              textAlign: TextAlign.center,
                            ),
                            Text(
                              'Explorez la carte pour en ajouter de nouveaux !',
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      );
    }

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ScreenTitle('Enregistrés'),
          Expanded(
            child: ListView.builder(
              itemCount: favorites.length,
              itemBuilder: (context, index) {
                final favorite = favorites[index];
                return ListTile(
                  title: Text((favorite['name'] ?? '') as String),
                  subtitle: favorite['address'] != null
                      ? Text(favorite['address'] as String)
                      : null,
                  onTap: () => navigate(favorite),
                  trailing: IconButton(
                    icon: Icon(Icons.star, color: colors.primary),
                    onPressed: () {
                      final json = {
                        ...favorite,
                        'name': favorite['name'] ?? '',
                        'longitude': favorite['longitude'] ?? 0,
                        'latitude': favorite['latitude'] ?? 0,
                      };
                      ref
                          .read(favoriteActionsProvider)
                          .removeFavorite(Store.fromJson(json));
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
