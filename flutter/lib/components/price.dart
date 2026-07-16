import 'package:flutter/material.dart';

import '../data/assets_data.dart';
import '../utils/price.dart';

/// Port de src/components/Price.js : montant + symbole de devise
/// (taille réduite pour les symboles longs).
class PriceText extends StatelessWidget {
  final num? amount;
  final String? currency;

  const PriceText({super.key, required this.amount, required this.currency});

  @override
  Widget build(BuildContext context) {
    final symbol = AssetsData.currencySymbol(currency);
    final double? symbolSize = switch (symbol.length) {
      1 => null,
      2 => 12,
      _ => 10,
    };
    return Text.rich(
      TextSpan(children: [
        TextSpan(text: '${displayPrice(amount)} '),
        TextSpan(text: symbol, style: TextStyle(fontSize: symbolSize)),
      ]),
    );
  }
}
