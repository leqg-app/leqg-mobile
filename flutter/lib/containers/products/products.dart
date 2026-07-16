import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/title.dart';
import '../../store/atoms.dart';

/// Port de src/containers/Products/Products.js : liste alphabétique des
/// bières.
class ProductsScreen extends ConsumerWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider);
    final productsList = [...products]
      ..sort((a, b) => a.name.compareTo(b.name));

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ScreenTitle('Bières'),
          Expanded(
            child: ListView.builder(
              itemExtent: 50,
              itemCount: productsList.length,
              itemBuilder: (context, index) => Container(
                padding: const EdgeInsets.only(left: 20),
                alignment: Alignment.centerLeft,
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Color(0x1F000000), width: 0.5),
                  ),
                ),
                child: Text(productsList[index].name),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
