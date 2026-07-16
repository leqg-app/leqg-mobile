import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Port de src/store/storage.js (MMKV → SharedPreferences), mêmes clés.
class Storage {
  static late SharedPreferences _prefs;

  static Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static String? getString(String key) => _prefs.getString(key);

  static void set(String key, Object value) {
    if (value is bool) {
      _prefs.setBool(key, value);
    } else {
      _prefs.setString(key, value.toString());
    }
  }

  static bool? getBool(String key) => _prefs.getBool(key);

  static bool contains(String key) => _prefs.containsKey(key);

  static void remove(String key) => _prefs.remove(key);

  static void setObject(String key, Object? obj) {
    try {
      _prefs.setString(key, jsonEncode(obj));
    } catch (_) {
      // ignore, comme l'app RN
    }
  }

  static T? getObject<T>(String key, [T? defaultValue]) {
    if (!_prefs.containsKey(key)) {
      return defaultValue;
    }
    try {
      return jsonDecode(_prefs.getString(key)!) as T;
    } catch (_) {
      return defaultValue;
    }
  }
}
