import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'containers/account/account.dart';
import 'containers/favorites/favorites.dart';
import 'containers/map/map_screen.dart';
import 'containers/map/store_sheet.dart';
import 'containers/products/products.dart';

/// Port de src/Tabs.js : 4 onglets + sheet du bar au-dessus de tout
/// (équivalent du Portal.Host).
final tabIndexProvider = StateProvider<int>((ref) => 0);

/// Navigateur imbriqué de l'onglet Compte (pour y revenir depuis les
/// dialogues « Connexion requise »).
final GlobalKey<NavigatorState> accountNavigatorKey =
    GlobalKey<NavigatorState>();

/// ≙ navigation.navigate('TabNavigator', { screen: 'AccountTab' })
void navigateToAccountTab(BuildContext context, WidgetRef ref) {
  Navigator.of(context, rootNavigator: true).popUntil((route) => route.isFirst);
  ref.read(tabIndexProvider.notifier).state = 3;
}

/// ≙ navigation.navigate('TabNavigator', { screen: 'MapTab' })
void navigateToMapTab(BuildContext context, WidgetRef ref) {
  Navigator.of(context, rootNavigator: true).popUntil((route) => route.isFirst);
  ref.read(tabIndexProvider.notifier).state = 0;
}

class TabNavigator extends ConsumerWidget {
  const TabNavigator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final index = ref.watch(tabIndexProvider);

    return Stack(
      children: [
        PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (didPop) {
              return;
            }
            // Bouton retour Android : dépiler l'onglet Compte, sinon quitter
            final accountNavigator = accountNavigatorKey.currentState;
            if (index == 3 &&
                accountNavigator != null &&
                accountNavigator.canPop()) {
              accountNavigator.pop();
              return;
            }
            SystemNavigator.pop();
          },
          child: Scaffold(
            body: IndexedStack(
              index: index,
              children: const [
                MapScreen(),
                ProductsScreen(),
                FavoritesScreen(),
                AccountTab(),
              ],
            ),
            bottomNavigationBar: NavigationBar(
              selectedIndex: index,
              onDestinationSelected: (newIndex) =>
                  ref.read(tabIndexProvider.notifier).state = newIndex,
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.map_outlined),
                  selectedIcon: Icon(Icons.map),
                  label: 'Carte',
                ),
                NavigationDestination(
                  icon: Icon(Icons.sports_bar_outlined),
                  selectedIcon: Icon(Icons.sports_bar),
                  label: 'Bières',
                ),
                NavigationDestination(
                  icon: Icon(Icons.bookmark_outline),
                  selectedIcon: Icon(Icons.bookmark),
                  label: 'Enregistrés',
                ),
                NavigationDestination(
                  icon: Icon(Icons.person_outline),
                  selectedIcon: Icon(Icons.person),
                  label: 'Compte',
                ),
              ],
            ),
          ),
        ),
        // Sheet du bar sélectionné, au-dessus de la barre d'onglets
        const StoreSheet(),
      ],
    );
  }
}
