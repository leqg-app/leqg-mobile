import 'client.dart';

/// Port de src/api/stores.js.
/// La version de l'API est chargée une seule fois au démarrage (comme le
/// `getVersion` top-level du fichier JS).
Future<Map<String, dynamic>>? _versionRequest;

Future<Map<String, dynamic>> getVersion() {
  _versionRequest ??=
      apiGet('/v1/version', {'cache-control': 'no-store'}).then((json) {
    return (json as Map).cast<String, dynamic>();
  }).catchError((_) => <String, dynamic>{});
  return _versionRequest!;
}

Future<List<dynamic>> getStores(dynamic version) async {
  return await apiGet('/v2/stores?v=${version ?? 1}') as List<dynamic>;
}

Future<dynamic> getStoresVersion(dynamic currentVersion, dynamic nextVersion) {
  return apiGet('/v2/stores/versions/$currentVersion..$nextVersion');
}

Future<Map<String, dynamic>> getStore(int id) async {
  return ((await apiGet('/v2/stores/$id')) as Map).cast<String, dynamic>();
}

Future<Map<String, dynamic>> addStore(
    Map<String, dynamic> data, String jwt) async {
  return ((await apiPost('/v2/stores', data, {'Authorization': 'bearer $jwt'}))
          as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> editStore(
    int id, Map<String, dynamic> data, String jwt) async {
  return ((await apiPut(
          '/v2/stores/$id', data, {'Authorization': 'bearer $jwt'})) as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> validateStore(
    int id, Map<String, dynamic> data, String jwt) async {
  return ((await apiPost('/v2/stores/$id/validate', data,
          {'Authorization': 'bearer $jwt'})) as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> rateStore(
    int id, Map<String, dynamic> data, String jwt) async {
  return ((await apiPost(
          '/v2/stores/$id/rate', data, {'Authorization': 'bearer $jwt'})) as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> addStorePhoto(
  int storeId, {
  required String imagePath,
  required Map<String, String> fields,
  required String jwt,
}) async {
  return ((await apiPostMultipart(
    '/v2/stores/$storeId/photos',
    fields: fields,
    filePath: imagePath,
    fileField: 'image',
    headers: {'Authorization': 'bearer $jwt'},
  )) as Map)
      .cast<String, dynamic>();
}
