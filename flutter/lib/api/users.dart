import 'client.dart';

/// Port de src/api/users.js.
Future<Map<String, dynamic>> signUp(Map<String, dynamic> data) async {
  return ((await apiPost('/v2/auth/local/register', data)) as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> signUpProvider(
    String provider, Map<String, dynamic> data) async {
  return ((await apiPost('/v2/auth/$provider/register', data)) as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> signIn(Map<String, dynamic> data) async {
  return ((await apiPost('/v2/auth/local', data)) as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> signInProvider(
    String provider, String authToken) async {
  return ((await apiGet('/v2/auth/$provider/callback?auth_token=$authToken'))
          as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> resetPassword(Map<String, dynamic> data) async {
  return ((await apiPost('/v2/auth/forgot-password', data)) as Map)
      .cast<String, dynamic>();
}

Future<Map<String, dynamic>> getProfile(String jwt) async {
  return ((await apiGet('/v2/users/me', {'Authorization': 'Bearer $jwt'}))
          as Map)
      .cast<String, dynamic>();
}

Future<List<dynamic>> getContributions(String jwt, [int page = 1]) async {
  return await apiGet('/v2/users/me/contributions?page=$page&limit=50',
      {'Authorization': 'Bearer $jwt'}) as List<dynamic>;
}

Future<Map<String, dynamic>> updateProfile(
    String jwt, Map<String, dynamic> data) async {
  return ((await apiPut('/v2/users/me', data, {'Authorization': 'Bearer $jwt'}))
          as Map)
      .cast<String, dynamic>();
}

Future<dynamic> deleteProfile(String jwt) {
  return apiDelete('/v2/users/me', {'Authorization': 'Bearer $jwt'});
}
