// Modèles de données : équivalents des objets JS manipulés par l'app RN.

int? _toInt(dynamic v) => v == null ? null : (v as num).toInt();
double? _toDouble(dynamic v) => v == null ? null : (v as num).toDouble();

/// Horaires d'un jour (schedules décompressés).
class Schedule {
  final int dayOfWeek; // 1 = lundi … 7 = dimanche
  final bool closed;
  final int? opening; // minutes depuis minuit
  final int? closing;
  final int? openingSpecial; // happy hour
  final int? closingSpecial;

  const Schedule({
    required this.dayOfWeek,
    this.closed = false,
    this.opening,
    this.closing,
    this.openingSpecial,
    this.closingSpecial,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) => Schedule(
        dayOfWeek: _toInt(json['dayOfWeek'])!,
        closed: json['closed'] == true,
        opening: _toInt(json['opening']),
        closing: _toInt(json['closing']),
        openingSpecial: _toInt(json['openingSpecial']),
        closingSpecial: _toInt(json['closingSpecial']),
      );

  Map<String, dynamic> toJson() => {
        'dayOfWeek': dayOfWeek,
        'closed': closed,
        'opening': opening,
        'closing': closing,
        'openingSpecial': openingSpecial,
        'closingSpecial': closingSpecial,
      };

  Schedule copyWith({
    int? dayOfWeek,
    bool? closed,
    int? Function()? opening,
    int? Function()? closing,
    int? Function()? openingSpecial,
    int? Function()? closingSpecial,
  }) =>
      Schedule(
        dayOfWeek: dayOfWeek ?? this.dayOfWeek,
        closed: closed ?? this.closed,
        opening: opening != null ? opening() : this.opening,
        closing: closing != null ? closing() : this.closing,
        openingSpecial:
            openingSpecial != null ? openingSpecial() : this.openingSpecial,
        closingSpecial:
            closingSpecial != null ? closingSpecial() : this.closingSpecial,
      );
}

/// Prix d'un produit dans productsById (liste compressée des bars).
class ProductPrice {
  final double? price;
  final double? specialPrice;
  final num? volume;

  const ProductPrice({this.price, this.specialPrice, this.volume});

  factory ProductPrice.fromJson(Map<String, dynamic> json) => ProductPrice(
        price: _toDouble(json['price']),
        specialPrice: _toDouble(json['specialPrice']),
        volume: json['volume'] as num?,
      );

  Map<String, dynamic> toJson() => {
        'price': price,
        'specialPrice': specialPrice,
        'volume': volume,
      };
}

/// Produit détaillé d'un bar (carte des bières, store complet de l'API).
class StoreProduct {
  final int? id;
  final String? tmpId;
  final int? productId;
  final String? productName;
  final String? type; // draft | bottle
  final num? volume;
  final double? price;
  final double? specialPrice;
  final String? currencyCode;

  const StoreProduct({
    this.id,
    this.tmpId,
    this.productId,
    this.productName,
    this.type,
    this.volume,
    this.price,
    this.specialPrice,
    this.currencyCode,
  });

  factory StoreProduct.fromJson(Map<String, dynamic> json) => StoreProduct(
        id: _toInt(json['id']),
        tmpId: json['tmpId'] as String?,
        productId: _toInt(json['productId'] ?? json['product']),
        productName: json['productName'] as String?,
        type: json['type'] as String?,
        volume: json['volume'] as num?,
        price: _toDouble(json['price']),
        specialPrice: _toDouble(json['specialPrice']),
        currencyCode: json['currencyCode'] as String?,
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        if (tmpId != null) 'tmpId': tmpId,
        'productId': productId,
        'productName': productName,
        'type': type,
        'volume': volume,
        'price': price,
        'specialPrice': specialPrice,
        'currencyCode': currencyCode,
      };

  StoreProduct copyWith({
    int? Function()? id,
    String? Function()? tmpId,
    int? Function()? productId,
    String? productName,
    String? type,
    num? volume,
    double? Function()? price,
    double? Function()? specialPrice,
    String? currencyCode,
  }) =>
      StoreProduct(
        id: id != null ? id() : this.id,
        tmpId: tmpId != null ? tmpId() : this.tmpId,
        productId: productId != null ? productId() : this.productId,
        productName: productName ?? this.productName,
        type: type ?? this.type,
        volume: volume ?? this.volume,
        price: price != null ? price() : this.price,
        specialPrice: specialPrice != null ? specialPrice() : this.specialPrice,
        currencyCode: currencyCode ?? this.currencyCode,
      );
}

/// Bar. Les champs "détail" (products, photos…) ne sont présents que sur les
/// stores complets chargés depuis /v2/stores/:id.
class Store {
  final int id;
  final String name;
  final String? address;
  final double longitude;
  final double latitude;
  final String? currencyCode;
  final Map<String, ProductPrice> productsById;
  final List<Schedule> schedules;
  final List<int> features;
  final double? rate;
  final int? rateCount;

  // Champs calculés côté state (storesState)
  final double? price;
  final bool? open;

  // Indicateur UI : centrer la carte sur ce bar
  final bool focus;

  // Champs du store complet
  final String? phone;
  final String? website;
  final String? updatedAt;
  final List<StoreProduct>? products;
  final List<dynamic>? photos;
  final List<dynamic>? validations;
  final List<dynamic>? rates;
  final List<dynamic>? revisions;

  const Store({
    required this.id,
    required this.name,
    this.address,
    required this.longitude,
    required this.latitude,
    this.currencyCode,
    this.productsById = const {},
    this.schedules = const [],
    this.features = const [],
    this.rate,
    this.rateCount,
    this.price,
    this.open,
    this.focus = false,
    this.phone,
    this.website,
    this.updatedAt,
    this.products,
    this.photos,
    this.validations,
    this.rates,
    this.revisions,
  });

  static List<int> _parseFeatures(dynamic features) {
    if (features is! List) return const [];
    return features
        .map((f) => f is Map ? _toInt(f['id']) : _toInt(f))
        .whereType<int>()
        .toList();
  }

  factory Store.fromJson(Map<String, dynamic> json) => Store(
        id: _toInt(json['id'])!,
        name: (json['name'] ?? '') as String,
        address: json['address'] as String?,
        longitude: _toDouble(json['longitude'])!,
        latitude: _toDouble(json['latitude'])!,
        currencyCode: json['currencyCode'] as String?,
        productsById: ((json['productsById'] ?? const {}) as Map).map(
          (key, value) => MapEntry(
            key.toString(),
            ProductPrice.fromJson((value as Map).cast<String, dynamic>()),
          ),
        ),
        schedules: ((json['schedules'] ?? const []) as List)
            .map((s) => Schedule.fromJson((s as Map).cast<String, dynamic>()))
            .toList(),
        features: _parseFeatures(json['features']),
        rate: _toDouble(json['rate']),
        rateCount: _toInt(json['rateCount']),
        price: _toDouble(json['price']),
        open: json['open'] as bool?,
        phone: json['phone'] as String?,
        website: json['website'] as String?,
        updatedAt: json['updatedAt'] as String?,
        products: json['products'] == null
            ? null
            : (json['products'] as List)
                .map((p) =>
                    StoreProduct.fromJson((p as Map).cast<String, dynamic>()))
                .toList(),
        photos: json['photos'] as List<dynamic>?,
        validations: json['validations'] as List<dynamic>?,
        rates: json['rates'] as List<dynamic>?,
        revisions: json['revisions'] as List<dynamic>?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'address': address,
        'longitude': longitude,
        'latitude': latitude,
        'currencyCode': currencyCode,
        'productsById':
            productsById.map((key, value) => MapEntry(key, value.toJson())),
        'schedules': schedules.map((s) => s.toJson()).toList(),
        'features': features,
        'rate': rate,
        'rateCount': rateCount,
        if (price != null) 'price': price,
        if (open != null) 'open': open,
      };

  Store copyWith({
    String? name,
    String? address,
    double? longitude,
    double? latitude,
    String? currencyCode,
    Map<String, ProductPrice>? productsById,
    List<Schedule>? schedules,
    List<int>? features,
    double? rate,
    int? rateCount,
    double? price,
    bool? open,
    bool? focus,
    List<StoreProduct>? products,
    List<dynamic>? validations,
  }) =>
      Store(
        id: id,
        name: name ?? this.name,
        address: address ?? this.address,
        longitude: longitude ?? this.longitude,
        latitude: latitude ?? this.latitude,
        currencyCode: currencyCode ?? this.currencyCode,
        productsById: productsById ?? this.productsById,
        schedules: schedules ?? this.schedules,
        features: features ?? this.features,
        rate: rate ?? this.rate,
        rateCount: rateCount ?? this.rateCount,
        price: price ?? this.price,
        open: open ?? this.open,
        focus: focus ?? this.focus,
        phone: phone,
        website: website,
        updatedAt: updatedAt,
        products: products ?? this.products,
        photos: photos,
        validations: validations ?? this.validations,
        rates: rates,
        revisions: revisions,
      );
}

/// Bière du catalogue global (/v1/products).
class Product {
  final int id;
  final String name;

  const Product({required this.id, required this.name});

  factory Product.fromJson(Map<String, dynamic> json) =>
      Product(id: _toInt(json['id'])!, name: (json['name'] ?? '') as String);

  Map<String, dynamic> toJson() => {'id': id, 'name': name};
}

/// Caractéristique et groupe de caractéristiques (/v1/features).
class Feature {
  final int id;
  final String name;

  const Feature({required this.id, required this.name});

  factory Feature.fromJson(Map<String, dynamic> json) =>
      Feature(id: _toInt(json['id'])!, name: (json['name'] ?? '') as String);

  Map<String, dynamic> toJson() => {'id': id, 'name': name};
}

class FeatureGroup {
  final String name;
  final List<Feature> features;

  const FeatureGroup({required this.name, required this.features});

  factory FeatureGroup.fromJson(Map<String, dynamic> json) => FeatureGroup(
        name: (json['name'] ?? '') as String,
        features: ((json['features'] ?? const []) as List)
            .map((f) => Feature.fromJson((f as Map).cast<String, dynamic>()))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'features': features.map((f) => f.toJson()).toList(),
      };
}

/// Taux de change (/v1/currencies).
class CurrencyRate {
  final String code;
  final double rate;

  const CurrencyRate({required this.code, required this.rate});

  factory CurrencyRate.fromJson(Map<String, dynamic> json) => CurrencyRate(
        code: (json['code'] ?? '') as String,
        rate: _toDouble(json['rate']) ?? 1,
      );

  Map<String, dynamic> toJson() => {'code': code, 'rate': rate};
}

/// Utilisateur connecté : on conserve le JSON brut de l'API (jwt, username,
/// favorites, contributions, provider…) comme le fait l'app RN.
class User {
  final Map<String, dynamic> data;

  const User(this.data);

  String get jwt => (data['jwt'] ?? '') as String;
  int? get id => _toInt(data['id']);
  String get username => (data['username'] ?? '') as String;
  String? get provider => data['provider'] as String?;

  List<Map<String, dynamic>> get favorites =>
      ((data['favorites'] ?? const []) as List)
          .map((f) => (f as Map).cast<String, dynamic>())
          .toList();

  List<Map<String, dynamic>> get contributions =>
      ((data['contributions'] ?? const []) as List)
          .map((c) => (c as Map).cast<String, dynamic>())
          .toList();

  double get reputation => contributions.fold(
      0, (total, c) => total + ((c['reputation'] as num?)?.toDouble() ?? 0));

  User copyWithFavorites(List<Map<String, dynamic>> favorites) =>
      User({...data, 'favorites': favorites});
}

/// Bar en cours d'édition (storeEditionState).
class StoreEdition {
  final int? id;
  final String name;
  final String? address;
  final double? longitude;
  final double? latitude;
  final String? countryCode;
  final String? phone;
  final String? website;
  final List<Schedule>? schedules;
  final List<int> features;
  final List<StoreProduct>? products;
  final List<dynamic>? revisions;

  const StoreEdition({
    this.id,
    this.name = '',
    this.address,
    this.longitude,
    this.latitude,
    this.countryCode,
    this.phone,
    this.website,
    this.schedules,
    this.features = const [],
    this.products,
    this.revisions,
  });

  factory StoreEdition.fromStore(Store store) => StoreEdition(
        id: store.id,
        name: store.name,
        address: store.address,
        longitude: store.longitude,
        latitude: store.latitude,
        phone: store.phone,
        website: store.website,
        schedules: store.schedules,
        features: store.features,
        products: store.products,
        revisions: store.revisions,
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'name': name,
        'address': address,
        'longitude': longitude,
        'latitude': latitude,
        if (countryCode != null) 'countryCode': countryCode,
        if (phone != null) 'phone': phone,
        if (website != null) 'website': website,
        if (schedules != null)
          'schedules': schedules!.map((s) => s.toJson()).toList(),
        'features': features.map((id) => {'id': id}).toList(),
        if (products != null)
          'products': products!.map((p) => p.toJson()).toList(),
      };

  StoreEdition copyWith({
    String? name,
    String? address,
    double? longitude,
    double? latitude,
    String? countryCode,
    String? phone,
    String? website,
    List<Schedule>? schedules,
    List<int>? features,
    List<StoreProduct>? products,
  }) =>
      StoreEdition(
        id: id,
        name: name ?? this.name,
        address: address ?? this.address,
        longitude: longitude ?? this.longitude,
        latitude: latitude ?? this.latitude,
        countryCode: countryCode ?? this.countryCode,
        phone: phone ?? this.phone,
        website: website ?? this.website,
        schedules: schedules ?? this.schedules,
        features: features ?? this.features,
        products: products ?? this.products,
        revisions: revisions,
      );
}

/// Filtre bières.
class ProductFilter {
  final List<Product> products;
  final bool filterAll;

  const ProductFilter({this.products = const [], this.filterAll = true});
}

/// Filtre horaires.
class ScheduleFilter {
  final List<int> days;
  final int startTime; // minutes, peut dépasser 1440 (lendemain)
  final int endTime;

  const ScheduleFilter({
    required this.days,
    required this.startTime,
    required this.endTime,
  });
}

/// Emprise de la carte.
class MapBounds {
  final List<double> northEast; // [lng, lat]
  final List<double> southWest;

  const MapBounds({required this.northEast, required this.southWest});
}
