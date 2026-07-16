import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

/// Port de src/utils/searchPlace.js (géocodage inverse Google).
String getCountryCode(List<dynamic> addressComponents) {
  for (final component in addressComponents) {
    final types = (component['types'] as List?) ?? const [];
    if (types.contains('country')) {
      return (component['short_name'] ?? '') as String;
    }
  }
  return '';
}

Future<Map<String, String>> searchPlaceGoogle(
    double longitude, double latitude) async {
  final query = {
    'key': dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '',
    'latlng': '$latitude,$longitude',
    'language': 'fr',
  };
  final uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', query);
  final response = jsonDecode((await http.get(uri)).body);
  final results = (response['results'] as List?) ?? const [];
  for (final result in results) {
    final formattedAddress = (result['formatted_address'] ?? '') as String;
    if (formattedAddress.contains('+')) {
      continue;
    }
    return {
      'address': formattedAddress,
      'countryCode':
          getCountryCode((result['address_components'] as List?) ?? const []),
    };
  }
  return {};
}
