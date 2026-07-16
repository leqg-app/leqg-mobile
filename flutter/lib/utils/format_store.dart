import '../models/models.dart';

/// Port de src/utils/formatStore.js.
double getLowest(Iterable<double?> numbers) {
  double lowest = 0;
  for (final number in numbers) {
    final n = number ?? 0;
    if (lowest == 0 || (n != 0 && n < lowest)) {
      lowest = n;
    }
  }
  return lowest;
}

List<Schedule> decompressSchedules(List<dynamic> compressedSchedule) {
  final schedules = <Schedule>[];
  for (var day = 0; day < compressedSchedule.length; day++) {
    final schedule = compressedSchedule[day];
    if (schedule == 0) {
      schedules.add(Schedule(dayOfWeek: day + 1, closed: true));
      continue;
    }
    final parts = (schedule is List) ? schedule : const [];
    final normal = (parts.isNotEmpty && parts[0] is List)
        ? parts[0] as List
        : const [];
    final special = (parts.length > 1 && parts[1] is List)
        ? parts[1] as List
        : const [];
    int? at(List list, int i) =>
        list.length > i && list[i] != null ? (list[i] as num).toInt() : null;
    schedules.add(Schedule(
      dayOfWeek: day + 1,
      closed: false,
      opening: at(normal, 0),
      closing: at(normal, 1),
      openingSpecial: at(special, 0),
      closingSpecial: at(special, 1),
    ));
  }
  return schedules;
}

Map<String, ProductPrice> getProductsById(List<dynamic> products) {
  final byId = <String, ProductPrice>{};
  for (final product in products) {
    final row = product as List;
    double? at(int i) => row.length > i && row[i] != null
        ? (row[i] as num).toDouble()
        : null;
    byId['${row[0]}'] = ProductPrice(
      price: at(1),
      specialPrice: at(2),
      volume: row.length > 3 ? row[3] as num? : null,
    );
  }
  return byId;
}

/// Store "compressé" (liste /v2/stores) → Store.
Store? storesToDatabase(dynamic compressedStore) {
  if (compressedStore is! List) {
    return null;
  }
  final s = compressedStore;
  return Store(
    id: (s[0] as num).toInt(),
    name: (s[1] ?? '') as String,
    address: s[2] as String?,
    longitude: (s[3] as num).toDouble(),
    latitude: (s[4] as num).toDouble(),
    // index 5 et 6 : champs obsolètes de l'API (cf. TODO côté RN)
    currencyCode: s[7] as String?,
    productsById: getProductsById(s[8] as List? ?? const []),
    schedules: decompressSchedules(s[9] as List? ?? const []),
    features: (s[10] as List? ?? const [])
        .map((f) => (f as num).toInt())
        .toList(),
    rate: s.length > 11 && s[11] != null ? (s[11] as num).toDouble() : null,
    rateCount: s.length > 12 && s[12] != null ? (s[12] as num).toInt() : null,
  );
}

/// Store complet renvoyé par l'API (POST/PUT) → Store stockable.
Store storeToDatabase(Map<String, dynamic> apiStore) {
  final store = Store.fromJson(apiStore);
  final products = store.products ?? const <StoreProduct>[];
  final productsById = <String, ProductPrice>{};
  for (final product in products) {
    productsById['${product.id}'] = ProductPrice(
      price: product.price,
      specialPrice: product.specialPrice,
      volume: product.volume,
    );
  }
  return Store(
    id: store.id,
    name: store.name,
    address: store.address,
    longitude: double.parse(store.longitude.toStringAsFixed(5)),
    latitude: double.parse(store.latitude.toStringAsFixed(5)),
    currencyCode: products.isNotEmpty
        ? (products.first.currencyCode ?? 'EUR')
        : 'EUR',
    productsById: productsById,
    schedules: store.schedules,
    features: store.features,
    rate: store.rate,
    rateCount: store.rateCount,
  );
}
