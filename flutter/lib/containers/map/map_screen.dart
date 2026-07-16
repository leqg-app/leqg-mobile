import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/search_bar.dart';
import '../../store/atoms.dart';
import 'filters/filters.dart';
import 'mapbox_map.dart';
import 'search_store.dart';

/// Port de src/containers/Map/Map.js : carte + barre de recherche + filtres +
/// snackbar de remerciement.
final contributeSnackbarProvider = StateProvider<bool>((ref) => false);

class MapScreen extends ConsumerWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storeLoading = ref.watch(storeLoadingProvider);

    ref.listen(contributeSnackbarProvider, (previous, next) {
      if (next) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Merci pour votre contribution !'),
            duration: Duration(seconds: 2),
          ),
        );
        ref.read(contributeSnackbarProvider.notifier).state = false;
      }
    });

    return Stack(
      children: [
        const MapboxMapView(),
        SafeArea(
          bottom: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MapSearchBar(
                loading: storeLoading,
                onSearch: () {
                  Navigator.of(context, rootNavigator: true).push(
                    PageRouteBuilder(
                      opaque: true,
                      pageBuilder: (context, animation, _) => FadeTransition(
                        opacity: animation,
                        child: const SearchStoreScreen(),
                      ),
                    ),
                  );
                },
              ),
              const Filters(),
            ],
          ),
        ),
      ],
    );
  }
}
