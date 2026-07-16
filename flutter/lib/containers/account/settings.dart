import 'package:flutter/material.dart';

import '../../components/menu.dart';
import '../../store/storage.dart';
import '../edit_store/select_currency.dart';

/// Port de src/containers/Account/Settings.js : préférences (devise).
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late String currency;

  @override
  void initState() {
    super.initState();
    currency = Storage.getString('userCurrencyCode') ?? 'EUR';
    Storage.set('userCurrencyCode', currency);
  }

  Future<void> _selectCurrency() async {
    final code = await Navigator.of(context).push<String>(
      MaterialPageRoute(
          builder: (context) =>
              const SelectCurrencyScreen(title: 'Devise préférée')),
    );
    if (code != null) {
      setState(() => currency = code);
      Storage.set('userCurrencyCode', code);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Préférences')),
      body: ListView(
        children: [
          MenuList(children: [
            MenuListItem(
              name: 'Devise préférée',
              onPress: _selectCurrency,
              last: true,
              value: currency,
              arrow: true,
            ),
          ]),
        ],
      ),
    );
  }
}
