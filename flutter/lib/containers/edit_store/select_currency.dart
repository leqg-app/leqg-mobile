import 'package:flutter/material.dart';

import '../../data/assets_data.dart';

/// Port de src/containers/EditStore/SelectCurrency.js : liste des devises
/// avec recherche dans la barre de titre. Retourne le code sélectionné.
class SelectCurrencyScreen extends StatefulWidget {
  final String title;

  const SelectCurrencyScreen({super.key, this.title = 'Devise'});

  @override
  State<SelectCurrencyScreen> createState() => _SelectCurrencyScreenState();
}

class _SelectCurrencyScreenState extends State<SelectCurrencyScreen> {
  String search = '';

  @override
  Widget build(BuildContext context) {
    final currenciesArray = AssetsData.currencies.entries
        .map((entry) => (
              code: entry.key,
              name: (entry.value['name'] ?? '') as String,
              symbol: (entry.value['symbol'] ?? '') as String,
            ))
        .where((currency) =>
            currency.name.toLowerCase().contains(search.toLowerCase()) ||
            currency.code.toLowerCase().contains(search.toLowerCase()))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          autofocus: true,
          onChanged: (value) => setState(() => search = value),
          decoration: InputDecoration(
            hintText: 'Chercher une devise',
            border: InputBorder.none,
            hintStyle: TextStyle(
                color: Theme.of(context)
                    .colorScheme
                    .onSurface
                    .withValues(alpha: 0.5)),
          ),
        ),
      ),
      body: ListView.builder(
        itemExtent: 50,
        itemCount: currenciesArray.length,
        itemBuilder: (context, index) {
          final currency = currenciesArray[index];
          return ListTile(
            leading: SizedBox(
              width: 50,
              child: Text(
                currency.symbol,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 17, fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(currency.name),
            onTap: () => Navigator.of(context).pop(currency.code),
          );
        },
      ),
    );
  }
}
