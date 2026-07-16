import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/action_buttons.dart';
import '../../../components/bar_rheostat.dart';
import '../../../components/filter_chip.dart';
import '../../../data/assets_data.dart';
import '../../../models/models.dart';
import '../../../store/atoms.dart';
import '../../../store/filter_atoms.dart';
import '../../../store/storage.dart';
import '../../../utils/coordinates.dart';

/// Port de src/containers/Map/Filters/PriceFilter.js.
String _getPrice(List<double>? priceRangeFilter) {
  if (priceRangeFilter == null) {
    return 'Prix';
  }
  final min = priceRangeFilter[0];
  final max = priceRangeFilter[1];
  String fmt(double v) => v == v.truncate() ? '${v.truncate()}' : '$v';
  if (min > 0 && max != 10) {
    return '${fmt(min)}€ - ${fmt(max)}€';
  }
  if (min > 0) {
    return '+ de ${fmt(min)}€';
  }
  if (max < 10) {
    return '- de ${fmt(max)}€';
  }
  return 'Prix';
}

double _getRate(String? currencyCode, List<CurrencyRate> rates) {
  if (currencyCode == null || currencyCode == 'EUR') {
    return 1;
  }
  for (final rate in rates) {
    if (rate.code == currencyCode) {
      return rate.rate;
    }
  }
  return 1;
}

({List<num> snaps, String average}) _getStats(
    List<Store> stores, List<CurrencyRate> rates, MapBounds? bounds) {
  final userCurrencyCode = Storage.getString('userCurrencyCode') ?? 'EUR';
  final userCurrencyRate = _getRate(userCurrencyCode, rates);
  final snaps = List<num>.filled(20, 0);
  double priceSum = 0;
  int storeCount = 0;
  for (final store in stores) {
    if (store.price == null || store.price == 0) {
      continue;
    }
    if (!isStoreInBounds(store, bounds)) {
      continue;
    }
    final price =
        store.price! / _getRate(store.currencyCode, rates) * userCurrencyRate;
    final step = (min((price * 2).round(), 20) - 1).clamp(0, 19);
    snaps[step] = snaps[step] + 1;
    storeCount++;
    priceSum += price;
  }
  final average =
      storeCount > 0 ? (priceSum / storeCount).toStringAsFixed(2) : 'NaN';
  return (snaps: snaps, average: average);
}

class PriceFilter extends ConsumerWidget {
  const PriceFilter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final price = ref.watch(priceFilterProvider);

    return MapFilterChip(
      icon: Icons.attach_money,
      label: _getPrice(price),
      onPress: () {
        ref.read(sheetStoreProvider.notifier).state = null;
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
          ),
          backgroundColor: Theme.of(context).colorScheme.surface,
          builder: (context) => const _PriceFilterSheet(),
        );
      },
      onRemove: price != null
          ? () => ref.read(priceFilterProvider.notifier).state = null
          : null,
    );
  }
}

class _PriceFilterSheet extends ConsumerStatefulWidget {
  const _PriceFilterSheet();

  @override
  ConsumerState<_PriceFilterSheet> createState() => _PriceFilterSheetState();
}

class _PriceFilterSheetState extends ConsumerState<_PriceFilterSheet> {
  List<double> values = [0, 20];

  @override
  void initState() {
    super.initState();
    final price = ref.read(priceFilterProvider);
    if (price != null) {
      values = [price[0] * 2, price[1] * 2];
    }
  }

  @override
  Widget build(BuildContext context) {
    final stores = ref.watch(storesProvider);
    final rates = ref.watch(ratesProvider);
    final mapBounds = ref.watch(mapBoundsProvider);
    final userCurrencyCode = Storage.getString('userCurrencyCode') ?? 'EUR';
    final currencySymbol = AssetsData.currencySymbol(userCurrencyCode);

    final stats = _getStats(stores, rates, mapBounds);

    final minValue = values[0] / 2;
    final maxValue = values[1] / 2;
    String fmt(double v) => v == v.truncate() ? '${v.truncate()}' : '$v';

    void submit() {
      ref.read(priceFilterProvider.notifier).state =
          (minValue > 0 || maxValue < 10) ? [minValue, maxValue] : null;
      Navigator.of(context).pop();
    }

    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding:
                const EdgeInsets.only(left: 20, right: 20, top: 10, bottom: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Fourchette de prix',
                    style: Theme.of(context).textTheme.titleMedium),
                Padding(
                  padding: const EdgeInsets.only(top: 15),
                  child: Text(
                    '${fmt(minValue)} $currencySymbol - ${maxValue == 10 ? 'Plus de 10' : fmt(maxValue)} $currencySymbol',
                    style: const TextStyle(fontSize: 17),
                  ),
                ),
                Text(
                    "Le prix moyen d'une pinte de bière est de ${stats.average} $currencySymbol"),
                SizedBox(
                  height: 270,
                  child: BarRheostat(
                    values: values,
                    min: 0,
                    max: 20,
                    svgData: stats.snaps,
                    onValuesUpdated: (newValues) =>
                        setState(() => values = newValues),
                  ),
                ),
              ],
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Colors.grey, width: 0.5)),
            ),
            child: ActionButtons(
              onCancel: () => Navigator.of(context).pop(),
              onSubmit: submit,
              submitLabel: 'OK',
            ),
          ),
        ],
      ),
    );
  }
}
