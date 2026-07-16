import 'dart:convert';

import 'package:flutter/services.dart';

/// Chargement des JSON embarqués (équivalent des imports statiques RN de
/// src/assets/currencies.json et countries.json).
class AssetsData {
  /// code devise → { name, symbol, … }
  static late Map<String, dynamic> currencies;

  /// code pays → code devise
  static late Map<String, dynamic> countries;

  static Future<void> initialize() async {
    currencies = jsonDecode(
        await rootBundle.loadString('assets/currencies.json'))
        as Map<String, dynamic>;
    countries = jsonDecode(await rootBundle.loadString('assets/countries.json'))
        as Map<String, dynamic>;
  }

  static String currencySymbol(String? code) {
    final currency = currencies[code ?? 'EUR'];
    return (currency?['symbol'] ?? '€') as String;
  }
}
