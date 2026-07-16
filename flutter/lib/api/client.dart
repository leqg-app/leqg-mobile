import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants.dart';

/// Port de src/api/index.js : mêmes endpoints, même gestion d'erreur
/// (un champ `error` dans la réponse devient une exception).
class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  @override
  String toString() => message;
}

Map<String, String> _baseHeaders(Map<String, String> headers) => {
      'user-agent': 'LeQG/$appVersion',
      ...headers,
    };

dynamic _handle(http.Response response) {
  final json = jsonDecode(utf8.decode(response.bodyBytes));
  if (json is Map && json['error'] != null) {
    throw ApiException(json['error'].toString());
  }
  return json;
}

Future<dynamic> apiGet(String path, [Map<String, String> headers = const {}]) async {
  final response = await http.get(Uri.parse('$apiEndpoint$path'),
      headers: _baseHeaders(headers));
  return _handle(response);
}

Future<dynamic> apiPost(String path, Object? data,
    [Map<String, String> headers = const {}]) async {
  final response = await http.post(
    Uri.parse('$apiEndpoint$path'),
    headers: _baseHeaders({'Content-Type': 'application/json', ...headers}),
    body: jsonEncode(data),
  );
  return _handle(response);
}

Future<dynamic> apiPut(String path, Object? data,
    [Map<String, String> headers = const {}]) async {
  final response = await http.put(
    Uri.parse('$apiEndpoint$path'),
    headers: _baseHeaders({'Content-Type': 'application/json', ...headers}),
    body: jsonEncode(data),
  );
  return _handle(response);
}

Future<dynamic> apiDelete(String path,
    [Map<String, String> headers = const {}]) async {
  final response = await http.delete(Uri.parse('$apiEndpoint$path'),
      headers: _baseHeaders(headers));
  return _handle(response);
}

/// Upload multipart (photos de bar).
Future<dynamic> apiPostMultipart(
  String path, {
  required Map<String, String> fields,
  required String filePath,
  required String fileField,
  Map<String, String> headers = const {},
}) async {
  final request = http.MultipartRequest('POST', Uri.parse('$apiEndpoint$path'));
  request.headers.addAll(_baseHeaders(headers));
  request.fields.addAll(fields);
  request.files.add(await http.MultipartFile.fromPath(fileField, filePath));
  final response = await http.Response.fromStream(await request.send());
  return _handle(response);
}
