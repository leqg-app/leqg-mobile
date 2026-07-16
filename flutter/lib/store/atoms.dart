import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/stores.dart' as stores_api;
import '../api/users.dart' as users_api;
import '../models/models.dart';
import '../utils/format_store.dart';
import '../utils/schedule_filters.dart';
import '../utils/time.dart';
import 'filter_atoms.dart';
import 'storage.dart';

/// Port de src/store/atoms.js : providers Riverpod équivalents des atomes.

// -- Utilisateur (persisté sous la clé `user`)

class UserNotifier extends Notifier<User?> {
  @override
  User? build() {
    final data = Storage.getObject<Map<String, dynamic>>('user');
    return data == null ? null : User(data);
  }

  void set(User? user) {
    state = user;
    if (user == null) {
      Storage.remove('user');
    } else {
      Storage.setObject('user', user.data);
    }
  }
}

final userProvider = NotifierProvider<UserNotifier, User?>(UserNotifier.new);

// -- Bar sélectionné (bottom sheet) et édition

final sheetStoreProvider = StateProvider<Store?>((ref) => null);
final storeEditionProvider =
    StateProvider<StoreEdition>((ref) => const StoreEdition());
final storeQueryRequestIDProvider = StateProvider<int>((ref) => 0);
final storeLoadingProvider = StateProvider<bool>((ref) => false);

// -- Liste des bars

class StoresNotifier extends Notifier<List<Store>> {
  @override
  List<Store> build() => [];

  void set(List<Store> stores) => state = stores;

  void update(List<Store> Function(List<Store>) updater) =>
      state = updater(state);
}

final storesRawProvider =
    NotifierProvider<StoresNotifier, List<Store>>(StoresNotifier.new);

/// Équivalent du getter de storesState : calcule prix affiché (happy hour en
/// cours → prix spécial) et statut ouvert.
final storesProvider = Provider<List<Store>>((ref) {
  final allStores = ref.watch(storesRawProvider);
  final all = <Store>[];
  final date = DateTime.now();
  final currentDay = date.weekday; // 1 = lundi … 7 = dimanche
  final now = date.hour * 60 + date.minute;

  for (final store in allStores) {
    final products = store.productsById.values.toList();
    final price = getLowest(products.map((p) => p.price));
    final specialPrice = getLowest(products.map((p) => p.specialPrice));

    if (price == 0 && specialPrice == 0) {
      continue;
    }

    Schedule? today;
    for (final s in store.schedules) {
      if (s.dayOfWeek == currentDay) {
        today = s;
        break;
      }
    }
    final open = (today?.closed ?? false)
        ? false
        : today == null ||
            today.opening == null ||
            today.closing == null ||
            inHours(today.opening, today.closing);

    if (price == 0) {
      all.add(store.copyWith(open: open, price: specialPrice));
      continue;
    }
    if (specialPrice == 0 ||
        today == null ||
        today.closed ||
        today.openingSpecial == null ||
        today.closingSpecial == null) {
      all.add(store.copyWith(price: price, open: open));
      continue;
    }

    final openingSpecial = today.openingSpecial!;
    final closingSpecial = today.closingSpecial!;
    final specialHours = openingSpecial < closingSpecial
        ? openingSpecial < now && now < closingSpecial
        : openingSpecial < now || now < closingSpecial;

    if (!specialHours) {
      all.add(store.copyWith(price: price, open: open));
      continue;
    }

    final productsById = store.productsById.map(
      (id, product) => MapEntry(
        id,
        ProductPrice(
          price: product.specialPrice,
          specialPrice: product.specialPrice,
          volume: product.volume,
        ),
      ),
    );
    all.add(store.copyWith(
        open: open, price: specialPrice, productsById: productsById));
  }
  return all;
});

/// FeatureCollection GeoJSON pour la carte (≙ storesMapState).
final storesMapProvider = Provider<Map<String, dynamic>>((ref) {
  final all = ref.watch(storesProvider);
  final scheduleFilter = ref.watch(scheduleFilterProvider);

  return {
    'type': 'FeatureCollection',
    'features': all
        .map((store) => {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [store.longitude, store.latitude],
              },
              'properties': {
                ...store.toJson(),
                'matchesScheduleFilter':
                    storeMatchesScheduleFilter(store, scheduleFilter),
              },
            })
        .toList(),
  };
});

// -- Entités globales (persistées en storage sous leur nom)

class ProductsNotifier extends Notifier<List<Product>> {
  @override
  List<Product> build() {
    final raw = Storage.getObject<List<dynamic>>('products', []);
    return raw!
        .map((p) => Product.fromJson((p as Map).cast<String, dynamic>()))
        .toList();
  }

  void set(List<Product> products) => state = products;
}

final productsProvider =
    NotifierProvider<ProductsNotifier, List<Product>>(ProductsNotifier.new);

class RatesNotifier extends Notifier<List<CurrencyRate>> {
  @override
  List<CurrencyRate> build() {
    final raw = Storage.getObject<List<dynamic>>('rates', []);
    return raw!
        .map((r) => CurrencyRate.fromJson((r as Map).cast<String, dynamic>()))
        .toList();
  }

  void set(List<CurrencyRate> rates) => state = rates;
}

final ratesProvider =
    NotifierProvider<RatesNotifier, List<CurrencyRate>>(RatesNotifier.new);

class FeaturesNotifier extends Notifier<List<FeatureGroup>> {
  @override
  List<FeatureGroup> build() {
    final raw = Storage.getObject<List<dynamic>>('features', []);
    return raw!
        .map((f) => FeatureGroup.fromJson((f as Map).cast<String, dynamic>()))
        .toList();
  }

  void set(List<FeatureGroup> features) => state = features;
}

final featuresProvider = NotifierProvider<FeaturesNotifier, List<FeatureGroup>>(
    FeaturesNotifier.new);

// -- Store complet par id (≙ storeState family : fetch au premier accès,
//    valeur remplaçable après une sauvegarde/note)

class StoreDetailNotifier extends FamilyAsyncNotifier<Store, int> {
  @override
  Future<Store> build(int arg) async {
    // Un refresh global (requestId) invalide et relance le fetch
    ref.watch(storeQueryRequestIDProvider);
    final json = await stores_api.getStore(arg);
    return Store.fromJson(json);
  }

  void set(Store store) => state = AsyncData(store);
}

final storeDetailProvider =
    AsyncNotifierProvider.family<StoreDetailNotifier, Store, int>(
        StoreDetailNotifier.new);

// -- Contributions de l'utilisateur

final contributionsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  ref.watch(storeQueryRequestIDProvider);
  final user = ref.watch(userProvider);
  if (user == null) {
    return [];
  }
  final contributions = await users_api.getContributions(user.jwt);
  return contributions
      .map((c) => (c as Map).cast<String, dynamic>())
      .toList();
});
