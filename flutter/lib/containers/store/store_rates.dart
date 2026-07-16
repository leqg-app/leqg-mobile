import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/dialogs.dart';
import '../../components/star_rating.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../tabs.dart';
import 'rating_store.dart';

/// Port de src/containers/Store/StoreRates.js : résumé des avis + votre note
/// ou « Donner une note ».
class StoreRates extends ConsumerWidget {
  final Store store;

  const StoreRates({super.key, required this.store});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final colors = Theme.of(context).colorScheme;

    Map<String, dynamic>? userRate;
    if (user != null) {
      for (final rate in store.rates ?? const []) {
        if (rate is Map && rate['user'] is Map &&
            rate['user']['id'] == user.id) {
          userRate = rate.cast<String, dynamic>();
          break;
        }
      }
    }

    void navigateRatingStore(int rate) {
      if (user == null) {
        showLoginRequiredDialog(
          context,
          message: 'Vous devez être connecté pour partager votre avis',
          onLogin: () {
            navigateToAccountTab(context, ref);
            ref.read(sheetStoreProvider.notifier).state = null;
          },
        );
        return;
      }
      Navigator.of(context, rootNavigator: true).push(
        MaterialPageRoute(
          builder: (context) => RatingStoreScreen(rate: rate),
        ),
      );
    }

    return Column(
      children: [
        if (store.rate != null && store.rate != 0)
          Padding(
            padding: const EdgeInsets.only(bottom: 18),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 20),
                  child: Column(
                    children: [
                      Text(
                        store.rate!.toStringAsFixed(1).replaceAll('.', ','),
                        style: Theme.of(context).textTheme.headlineLarge,
                      ),
                      Text('(${store.rateCount})',
                          style: Theme.of(context).textTheme.labelSmall),
                    ],
                  ),
                ),
                StarRating(
                  color: colors.primary,
                  rating: (store.rate! * 2).round() / 2,
                ),
              ],
            ),
          )
        else
          const Padding(
            padding: EdgeInsets.only(bottom: 18),
            child: Center(child: Text('Aucune note pour le moment')),
          ),
        const Divider(),
        if (userRate != null)
          Padding(
            padding: const EdgeInsets.only(top: 15, left: 15, right: 15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Votre avis',
                    style: TextStyle(
                        fontSize: 15, fontWeight: FontWeight.bold)),
                Container(
                  margin: const EdgeInsets.only(top: 10, bottom: 20),
                  alignment: Alignment.center,
                  child: StarRating(
                    color: colors.primary,
                    rating: (((userRate['rate1'] ?? 0) as num) +
                            ((userRate['rate2'] ?? 0) as num) +
                            ((userRate['rate3'] ?? 0) as num)) /
                        3,
                    emptyColor: Colors.grey,
                  ),
                ),
              ],
            ),
          )
        else
          Padding(
            padding: const EdgeInsets.only(top: 15, left: 15, right: 15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Donner une note',
                    style: TextStyle(
                        fontSize: 15, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Text('Partagez votre expérience à la communauté'),
                Container(
                  margin: const EdgeInsets.only(top: 10, bottom: 20),
                  alignment: Alignment.center,
                  child: StarRating(
                    color: colors.primary,
                    rating: 0,
                    onChange: navigateRatingStore,
                    emptyColor: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        const Divider(),
      ],
    );
  }
}
