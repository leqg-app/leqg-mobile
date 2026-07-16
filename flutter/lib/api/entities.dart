import 'client.dart';

/// Port de src/api/{products,rates,features}.js.
Future<List<dynamic>> getProducts(dynamic version) async {
  return await apiGet('/v1/products?v=${version ?? 1}') as List<dynamic>;
}

Future<List<dynamic>> getRates(dynamic version) async {
  return await apiGet('/v1/currencies?v=${version ?? 1}') as List<dynamic>;
}

Future<List<dynamic>> getFeatures(dynamic version) async {
  return await apiGet('/v1/features?v=${version ?? 1}') as List<dynamic>;
}
