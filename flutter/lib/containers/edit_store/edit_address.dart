import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../../store/atoms.dart';
import '../../utils/search_place.dart';

/// Port de src/containers/EditStore/EditAddress.js : autocomplete d'adresse
/// Google Places.
class EditAddressScreen extends ConsumerStatefulWidget {
  const EditAddressScreen({super.key});

  @override
  ConsumerState<EditAddressScreen> createState() => _EditAddressScreenState();
}

class _EditAddressScreenState extends ConsumerState<EditAddressScreen> {
  List<Map<String, dynamic>> predictions = [];
  Timer? _debounce;
  final _sessionToken = DateTime.now().millisecondsSinceEpoch.toString();

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  void _search(String input) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 100), () async {
      if (input.isEmpty) {
        setState(() => predictions = []);
        return;
      }
      final uri = Uri.https(
          'maps.googleapis.com', '/maps/api/place/autocomplete/json', {
        'key': dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '',
        'language': 'fr',
        'input': input,
        'sessiontoken': _sessionToken,
      });
      try {
        final response = jsonDecode((await http.get(uri)).body);
        if (!mounted) {
          return;
        }
        setState(() {
          predictions = ((response['predictions'] as List?) ?? const [])
              .map((p) => (p as Map).cast<String, dynamic>())
              .toList();
        });
      } catch (_) {}
    });
  }

  Future<void> _selectPrediction(Map<String, dynamic> prediction) async {
    final uri = Uri.https('maps.googleapis.com', '/maps/api/place/details/json', {
      'key': dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '',
      'language': 'fr',
      'place_id': (prediction['place_id'] ?? '') as String,
      'fields': 'geometry,address_components',
      'sessiontoken': _sessionToken,
    });
    final response = jsonDecode((await http.get(uri)).body);
    final result = response['result'] as Map?;
    if (result == null || !mounted) {
      return;
    }
    final location = result['geometry']?['location'] as Map?;
    final storeEdition = ref.read(storeEditionProvider);
    ref.read(storeEditionProvider.notifier).state = storeEdition.copyWith(
      address: (prediction['description'] ?? '') as String,
      latitude: (location?['lat'] as num?)?.toDouble(),
      longitude: (location?['lng'] as num?)?.toDouble(),
      countryCode: getCountryCode(
          (result['address_components'] as List?) ?? const []),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Modifier l'adresse")),
      body: Column(
        children: [
          TextField(
            autofocus: true,
            onChanged: _search,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              hintText: 'Rechercher une adresse',
              prefixIcon: Icon(Icons.search),
              border: InputBorder.none,
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              keyboardDismissBehavior:
                  ScrollViewKeyboardDismissBehavior.manual,
              itemCount: predictions.length,
              itemBuilder: (context, index) => ListTile(
                title:
                    Text((predictions[index]['description'] ?? '') as String),
                onTap: () => _selectPrediction(predictions[index]),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
