import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/models.dart';

/// Port de src/store/filterAtoms.js.
final productFilterProvider = StateProvider<ProductFilter>(
    (ref) => const ProductFilter(products: [], filterAll: true));

final priceFilterProvider = StateProvider<List<double>?>((ref) => null);
final featureFilterProvider = StateProvider<List<int>?>((ref) => null);
final scheduleFilterProvider = StateProvider<ScheduleFilter?>((ref) => null);
final mapBoundsProvider = StateProvider<MapBounds?>((ref) => null);

class MapboxExpressions {
  final List<dynamic> filters;
  final dynamic textField;
  final dynamic symbolSortKey;
  final dynamic textSize;

  const MapboxExpressions({
    required this.filters,
    required this.textField,
    required this.symbolSortKey,
    required this.textSize,
  });
}

/// Expressions Mapbox dérivées des filtres (≙ mapboxState) : mêmes
/// expressions JSON que l'app RN.
final mapboxProvider = Provider<MapboxExpressions>((ref) {
  final filters = <dynamic>[];
  final productFilter = ref.watch(productFilterProvider);
  final priceFilter = ref.watch(priceFilterProvider);
  final featureFilter = ref.watch(featureFilterProvider);
  final scheduleFilter = ref.watch(scheduleFilterProvider);

  dynamic cheapestPrice = ['get', 'price'];

  if (productFilter.products.isNotEmpty) {
    final products = productFilter.products;
    final filterType = productFilter.filterAll ? 'all' : 'any';
    filters.add([
      filterType,
      ...products.map((product) => [
            'to-boolean',
            [
              'get',
              'price',
              [
                'get',
                '${product.id}',
                [
                  'object',
                  ['get', 'productsById']
                ]
              ]
            ]
          ]),
    ]);

    // Mettre à jour les prix affichés sur la carte
    cheapestPrice = [
      'min',
      ...products.map((product) => [
            'coalesce',
            [
              'get',
              'price',
              [
                'get',
                '${product.id}',
                [
                  'object',
                  ['get', 'productsById']
                ]
              ]
            ],
            999999
          ]),
    ];
  }

  if (priceFilter != null) {
    final min = priceFilter[0];
    final max = priceFilter[1];
    if (min > 0) {
      filters.add(['>=', cheapestPrice, min]);
    }
    if (max < 10) {
      filters.add(['<=', cheapestPrice, max]);
    }
  }

  if (featureFilter != null) {
    filters.addAll(featureFilter.map((id) => [
          'in',
          id,
          ['get', 'features']
        ]));
  }
  if (scheduleFilter != null) {
    filters.add(['get', 'matchesScheduleFilter']);
  }

  return MapboxExpressions(
    filters: filters.isNotEmpty
        ? filters
        : [
            ['has', 'id']
          ],
    textField: ['to-string', cheapestPrice],
    symbolSortKey: cheapestPrice,
    textSize: [
      'case',
      [
        '<',
        3,
        [
          'length',
          ['to-string', cheapestPrice]
        ]
      ],
      11,
      13,
    ],
  );
});
