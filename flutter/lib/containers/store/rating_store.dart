import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/stores.dart' as stores_api;
import '../../components/star_rating.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../store/database.dart';
import '../../utils/error_message.dart';
import '../../utils/format_store.dart';
import '../account/won_reputation.dart';

const _errorMessages = {
  'user.notfound': 'Vous devez être connecté pour publier votre avis',
  'store.notfound': "Ce lieu n'existe pas ou plus",
  'store.rate.duplicate': 'Vous avez déjà donné votre avis à ce lieu',
};

/// Port de src/containers/Store/RatingStore.js : notation en 3 critères.
class RatingStoreScreen extends ConsumerStatefulWidget {
  final int rate;

  const RatingStoreScreen({super.key, required this.rate});

  @override
  ConsumerState<RatingStoreScreen> createState() => _RatingStoreScreenState();
}

class _RatingStoreScreenState extends ConsumerState<RatingStoreScreen> {
  bool loading = false;
  String? error;
  late int rate1 = widget.rate;
  late int rate2 = widget.rate;
  late int rate3 = widget.rate;

  Future<void> _publish() async {
    final sheetStore = ref.read(sheetStoreProvider);
    final user = ref.read(userProvider);
    setState(() {
      loading = true;
      error = null;
    });
    try {
      if (user == null) {
        throw 'user.notfound';
      }
      final data = {
        'rate1': rate1,
        'rate2': rate2,
        'rate3': rate3,
        'comment': '',
        'recommendedProducts': [],
      };
      final response =
          await stores_api.rateStore(sheetStore!.id, data, user.jwt);
      setState(() => loading = false);

      final responseStore =
          (response['store'] as Map).cast<String, dynamic>();
      final store = Store.fromJson(responseStore);
      ref.read(storeDetailProvider(sheetStore.id).notifier).set(store);
      ref.read(sheetStoreProvider.notifier).state = store;
      StoreDatabase.setStore(storeToDatabase(responseStore));

      final reputation =
          (response['reputation'] as Map?)?.cast<String, dynamic>() ?? {};
      if (mounted) {
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (context) => WonReputationScreen(reputation: reputation),
        ));
      }
    } catch (err) {
      setState(() {
        loading = false;
        error = getErrorMessage(err, _errorMessages);
      });
    }
  }

  Widget _rateRow(int value, void Function(int) onChange) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          StarRating(color: colors.primary, rating: value.toDouble(),
              onChange: onChange),
          Container(
            width: 45,
            margin: const EdgeInsets.only(left: 10),
            child: Text(
              '$value/5',
              textAlign: TextAlign.right,
              style:
                  const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final sheetStore = ref.watch(sheetStoreProvider);
    final colors = Theme.of(context).colorScheme;
    final storeRate = (rate1 + rate2 + rate3) / 3;

    const labelStyle =
        TextStyle(fontSize: 14, fontWeight: FontWeight.w700);

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  Expanded(
                    child: Text(
                      sheetStore?.name ?? '',
                      style: const TextStyle(
                          fontSize: 19, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(bottom: 25),
                      child: Text('Dites nous en plus sur votre expérience',
                          style: TextStyle(fontSize: 17)),
                    ),
                    const Padding(
                      padding: EdgeInsets.only(bottom: 10),
                      child:
                          Text('Le rapport qualité/prix:', style: labelStyle),
                    ),
                    _rateRow(rate1, (r) => setState(() => rate1 = r)),
                    const Padding(
                      padding: EdgeInsets.only(bottom: 10),
                      child: Text('Le lieu:', style: labelStyle),
                    ),
                    _rateRow(rate2, (r) => setState(() => rate2 = r)),
                    const Padding(
                      padding: EdgeInsets.only(bottom: 10),
                      child: Text("L'accueil:", style: labelStyle),
                    ),
                    _rateRow(rate3, (r) => setState(() => rate3 = r)),
                    const Divider(),
                    Padding(
                      padding: const EdgeInsets.only(top: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(
                            padding: EdgeInsets.only(bottom: 10),
                            child: Text('Note finale:', style: labelStyle),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              StarRating(
                                color: colors.primary,
                                rating: (storeRate * 2).round() / 2,
                              ),
                              Container(
                                width: 45,
                                margin: const EdgeInsets.only(left: 10),
                                child: Text(
                                  '${storeRate.toStringAsFixed(1)}/5',
                                  textAlign: TextAlign.right,
                                  style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: 20),
                      child: SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: loading ? null : _publish,
                          child:
                              Text(loading ? 'Chargement...' : 'Publier'),
                        ),
                      ),
                    ),
                    if (error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(error!,
                            style: TextStyle(color: colors.error)),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
