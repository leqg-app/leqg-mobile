import 'dart:convert';

import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../models/models.dart';
import '../utils/log_error.dart';

/// Port de src/store/database.js : table `store` au même schéma.
class StoreDatabase {
  static late Database _db;

  static Future<void> initialize() async {
    final path = p.join(await getDatabasesPath(), 'leqg.sqlite');
    _db = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE store (
            id INTEGER PRIMARY KEY,
            name TEXT,
            address TEXT,
            latitude REAL,
            longitude REAL,
            currencyCode TEXT,
            productsById TEXT,
            schedules TEXT,
            features TEXT,
            rate REAL,
            rateCount INTEGER
          )
        ''');
      },
    );
  }

  static Map<String, dynamic> _rowToJson(Map<String, dynamic> row) => {
        ...row,
        'productsById':
            row['productsById'] == null ? {} : jsonDecode(row['productsById']),
        'schedules':
            row['schedules'] == null ? [] : jsonDecode(row['schedules']),
        'features': row['features'] == null ? [] : jsonDecode(row['features']),
      };

  static Future<List<Store>> getStores() async {
    try {
      final rows = await _db.query('store');
      return rows.map((row) => Store.fromJson(_rowToJson(row))).toList();
    } catch (error, stack) {
      logError(error, stack, {'function': 'getStores'});
      return [];
    }
  }

  static Map<String, dynamic> _storeToRow(Store store) => {
        'id': store.id,
        'name': store.name,
        'address': store.address,
        'latitude': store.latitude,
        'longitude': store.longitude,
        'currencyCode': store.currencyCode,
        'productsById': jsonEncode(
            store.productsById.map((key, v) => MapEntry(key, v.toJson()))),
        'schedules': jsonEncode(store.schedules.map((s) => s.toJson()).toList()),
        'features': jsonEncode(store.features),
        'rate': store.rate,
        'rateCount': store.rateCount,
      };

  static Future<void> setStores(List<Store> stores) async {
    try {
      final batch = _db.batch();
      batch.delete('store');
      for (final store in stores) {
        batch.insert('store', _storeToRow(store));
      }
      await batch.commit(noResult: true);
    } catch (error, stack) {
      logError(error, stack,
          {'function': 'setStores', 'storesCount': stores.length});
    }
  }

  static Future<void> setStore(Store store) async {
    try {
      await _db.update('store', _storeToRow(store),
          where: 'id = ?', whereArgs: [store.id]);
    } catch (error, stack) {
      logError(error, stack, {'function': 'setStore', 'storeId': store.id});
    }
  }
}
