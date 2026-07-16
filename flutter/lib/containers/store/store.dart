import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/dialogs.dart';
import '../../constants.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../store/favorites.dart';
import '../../tabs.dart';
import '../../utils/time_ago.dart';
import '../../utils/url.dart';
import '../store/store_products.dart';
import 'schedules.dart';
import 'schedules_preview.dart';
import 'store_features.dart';
import 'store_rates.dart';
import 'store_ui_actions.dart';
import 'store_validate.dart';

/// Port de src/containers/Store/StoreActions.js (ActionButton).
class ActionButton extends StatelessWidget {
  final String name;
  final IconData icon;
  final VoidCallback onPress;
  final Color? color;

  const ActionButton({
    super.key,
    required this.name,
    required this.icon,
    required this.onPress,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Column(
      children: [
        Material(
          shape: const CircleBorder(),
          color: colors.primary,
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onPress,
            child: SizedBox(
              width: 45,
              height: 45,
              child: Icon(icon, color: color ?? colors.onPrimary, size: 22),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(name, textAlign: TextAlign.center),
      ],
    );
  }
}

/// Ligne d'information cliquable (≙ ListInfo de Store.js).
class _ListInfo extends StatelessWidget {
  final VoidCallback onPress;
  final String content;
  final IconData icon;
  final bool chevron = true;

  const _ListInfo({
    required this.onPress,
    required this.content,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPress,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 15),
        child: Row(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Icon(icon,
                  size: 24, color: Theme.of(context).colorScheme.primary),
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(content)),
            if (chevron)
              const Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(Icons.chevron_right),
              ),
          ],
        ),
      ),
    );
  }
}

/// Boutons Enregistrer / Appeler (≙ StoreActionButtons, store complet requis).
class _StoreActionButtons extends ConsumerWidget {
  final int id;

  const _StoreActionButtons({required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storeAsync = ref.watch(storeDetailProvider(id));
    final user = ref.watch(userProvider);
    final colors = Theme.of(context).colorScheme;

    return storeAsync.maybeWhen(
      data: (store) {
        final isFavorite = user?.favorites
                .any((favorite) => favorite['id'] == store.id) ??
            false;

        void toggleFavorite() {
          if (user == null) {
            showLoginRequiredDialog(
              context,
              message:
                  'Vous devez être connecté pour enregistrer ce bar dans vos favoris',
              onLogin: () {
                navigateToAccountTab(context, ref);
                ref.read(sheetStoreProvider.notifier).state = null;
              },
            );
            return;
          }
          if (isFavorite) {
            ref.read(favoriteActionsProvider).removeFavorite(store);
          } else {
            ref.read(favoriteActionsProvider).addFavorite(store);
          }
        }

        return Row(
          children: [
            ActionButton(
              onPress: toggleFavorite,
              name: 'Enregistrer',
              color: isFavorite ? const Color(0xFFFFD700) : colors.onPrimary,
              icon: isFavorite ? Icons.star : Icons.star_border,
            ),
            if (store.phone != null && store.phone!.isNotEmpty) ...[
              const SizedBox(width: 30),
              ActionButton(
                onPress: () => callStore(store),
                name: 'Appeler',
                icon: Icons.phone,
                color: colors.onPrimary,
              ),
            ],
          ],
        );
      },
      orElse: () => const SizedBox.shrink(),
    );
  }
}

/// Photos du bar (store complet).
class _StoreEnrichedPhotos extends ConsumerWidget {
  final int id;

  const _StoreEnrichedPhotos({required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storeAsync = ref.watch(storeDetailProvider(id));
    return storeAsync.maybeWhen(
      data: (store) {
        final photos = store.photos ?? const [];
        if (photos.isEmpty) {
          return const SizedBox.shrink();
        }
        return Container(
          height: 100,
          margin: const EdgeInsets.symmetric(vertical: 10),
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 15),
            children: [
              for (final photo in photos)
                Container(
                  width: 200,
                  height: 200,
                  margin: const EdgeInsets.only(right: 10),
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Image.network(
                    '$apiEndpoint${photo is Map ? photo['url'] : photo}',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stack) =>
                        const SizedBox.shrink(),
                  ),
                ),
            ],
          ),
        );
      },
      orElse: () => const SizedBox.shrink(),
    );
  }
}

/// Message hors-ligne / erreur avec bouton réessayer (≙ OfflineMessage).
class _OfflineMessage extends StatelessWidget {
  final Object error;
  final VoidCallback onRetry;

  const _OfflineMessage({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final isServerError = error.toString().contains('Internal Server Error');
    return SizedBox(
      height: 300,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(isServerError
              ? 'Une erreur est survenue, merci de réessayer plus tard'
              : 'Veuillez vérifier votre connexion internet'),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Icon(isServerError ? Icons.cloud_off : Icons.wifi_off),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 30),
            child: OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Touchez ici pour réessayer'),
            ),
          ),
        ],
      ),
    );
  }
}

/// Contenu détaillé du bar (store complet chargé, ≙ StoreContent de Store.js).
class _StoreDetailContent extends ConsumerWidget {
  final Store store;

  const _StoreDetailContent({required this.store});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: TextButton.icon(
            onPressed: () => editStoreScreen(context, ref, store),
            icon: const Icon(Icons.edit, size: 18),
            label: const Text('Suggérer une modification'),
          ),
        ),
        Card.outlined(
          margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
          child: _ListInfo(
            onPress: () {
              Navigator.of(context, rootNavigator: true).push(
                MaterialPageRoute(
                  builder: (context) =>
                      StoreProductsScreen(storeId: store.id),
                ),
              );
            },
            content: 'Voir la carte',
            icon: Icons.sports_bar,
          ),
        ),
        if (store.website != null || store.phone != null)
          Card.outlined(
            margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
            child: Column(
              children: [
                if (store.website != null) ...[
                  const Divider(height: 1),
                  _ListInfo(
                    onPress: () => launchStoreWebsite(store),
                    content: getUrlHost(store.website),
                    icon: Icons.public,
                  ),
                ],
                if (store.phone != null) ...[
                  const Divider(height: 1),
                  _ListInfo(
                    onPress: () => callStore(store),
                    content: store.phone!,
                    icon: Icons.phone,
                  ),
                ],
              ],
            ),
          ),
        if (store.features.isNotEmpty) ...[
          const Padding(
            padding: EdgeInsets.only(left: 15, top: 20, bottom: 10),
            child: Text('Caractéristiques',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15),
            child: StoreFeatures(features: store.features),
          ),
        ],
        const Padding(
          padding: EdgeInsets.only(left: 15, top: 20, bottom: 10),
          child: Text('Avis',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ),
        StoreRates(store: store),
        if (store.updatedAt != null)
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Center(
              child: Text(
                'Mis à jour ${formatDistanceToNow(DateTime.parse(store.updatedAt!))}',
              ),
            ),
          ),
      ],
    );
  }
}

/// Port de src/containers/Store/Store.js : contenu complet du sheet.
class StoreContent extends ConsumerStatefulWidget {
  final Store sheetStore;

  const StoreContent({super.key, required this.sheetStore});

  @override
  ConsumerState<StoreContent> createState() => _StoreContentState();
}

class _StoreContentState extends ConsumerState<StoreContent> {
  bool expandSchedules = false;

  @override
  Widget build(BuildContext context) {
    final sheetStore = widget.sheetStore;
    final colors = Theme.of(context).colorScheme;
    final storeAsync = ref.watch(storeDetailProvider(sheetStore.id));

    void refreshStore() =>
        ref.read(storeQueryRequestIDProvider.notifier).state++;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              ActionButton(
                onPress: () => openAddress(sheetStore),
                name: 'Itinéraire',
                icon: Icons.directions,
                color: colors.onPrimary,
              ),
              ActionButton(
                onPress: () => shareStore(sheetStore),
                name: 'Partager',
                icon: Icons.share,
                color: colors.onPrimary,
              ),
              _StoreActionButtons(id: sheetStore.id),
            ],
          ),
        ),
        _StoreEnrichedPhotos(id: sheetStore.id),
        storeAsync.maybeWhen(
          data: (store) => StoreValidate(store: store),
          orElse: () => const SizedBox.shrink(),
        ),
        Card.outlined(
          margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
          child: Column(
            children: [
              _ListInfo(
                onPress: () => openAddress(sheetStore),
                content: sheetStore.address ?? '',
                icon: Icons.place,
              ),
              const Divider(height: 1),
              InkWell(
                onTap: () =>
                    setState(() => expandSchedules = !expandSchedules),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  child: !expandSchedules
                      ? Row(
                          children: [
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 10),
                              child: Icon(Icons.access_time_filled,
                                  size: 24, color: colors.primary),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: SchedulesPreview(
                                  schedules: sheetStore.schedules),
                            ),
                            const Padding(
                              padding: EdgeInsets.only(right: 10),
                              child: Icon(Icons.keyboard_arrow_down),
                            ),
                          ],
                        )
                      : Padding(
                          padding: const EdgeInsets.only(
                              left: 20, right: 20, top: 20),
                          child: Schedules(schedules: sheetStore.schedules),
                        ),
                ),
              ),
            ],
          ),
        ),
        storeAsync.when(
          data: (store) => _StoreDetailContent(store: store),
          loading: () => const SizedBox(
            height: 300,
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (error, stack) =>
              _OfflineMessage(error: error, onRetry: refreshStore),
        ),
      ],
    );
  }
}
