import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../store/atoms.dart';

/// Port de src/components/SearchBar.js : barre de recherche au-dessus de la
/// carte (logo ou flèche retour quand un bar est sélectionné).
class MapSearchBar extends ConsumerWidget {
  final VoidCallback onSearch;
  final bool loading;

  const MapSearchBar({super.key, required this.onSearch, this.loading = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final sheetStore = ref.watch(sheetStoreProvider);

    return Container(
      margin: const EdgeInsets.only(top: 10, left: 18, right: 18),
      height: 50,
      child: Material(
        elevation: 4,
        borderRadius: BorderRadius.circular(30),
        color: theme.colorScheme.surface,
        child: Row(
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 10, right: 11),
              child: sheetStore != null
                  ? IconButton(
                      icon: const Icon(Icons.arrow_back),
                      onPressed: () =>
                          ref.read(sheetStoreProvider.notifier).state = null,
                    )
                  : Padding(
                      padding: const EdgeInsets.only(left: 12, right: 1),
                      child: Image.asset('assets/icon-transparent.png',
                          width: 35, height: 35),
                    ),
            ),
            Expanded(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: onSearch,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Rechercher un bar',
                    maxLines: 1,
                    style: TextStyle(
                      fontSize: 16,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ),
            ),
            if (loading)
              const Padding(
                padding: EdgeInsets.only(right: 15),
                child: SizedBox(
                  width: 19,
                  height: 19,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
