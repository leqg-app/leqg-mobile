import '../models/models.dart';

/// Port de src/utils/price.js.
String displayPrice(num? price) {
  if (price == null) {
    return '';
  }
  if (price == price.truncate()) {
    return price.truncate().toString();
  }
  return price.toStringAsFixed(2).replaceAll('.', ',');
}

double? parsePrice(dynamic price) {
  if (price == null) {
    return null;
  }
  final parsed = double.tryParse(price.toString().replaceAll(',', '.'));
  return parsed;
}

int sortByPrices(StoreProduct a, StoreProduct b) {
  final subtracted = (a.price ?? 0) - (b.price ?? 0);
  if (subtracted != 0) {
    return subtracted.sign.toInt();
  }
  if (a.specialPrice != null && b.specialPrice != null) {
    return (a.specialPrice! - b.specialPrice!).sign.toInt();
  }
  return 0;
}
