import 'package:flutter/material.dart';

import '../models/models.dart';

/// Port de src/components/ProductsList.js : liste de bières sélectionnables.
class ProductsList extends StatelessWidget {
  final List<Product> products;
  final List<Product> selected;
  final void Function(Product product) onToggle;
  final ScrollController? controller;

  const ProductsList({
    super.key,
    required this.products,
    required this.selected,
    required this.onToggle,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: controller,
      itemExtent: 50,
      itemCount: products.length,
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.manual,
      itemBuilder: (context, index) {
        final product = products[index];
        final isSelected = selected.any((p) => p.id == product.id);
        return InkWell(
          onTap: () => onToggle(product),
          child: Container(
            padding: const EdgeInsets.only(left: 20),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0x1F000000), width: 0.5),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(product.name),
                if (isSelected)
                  const Padding(
                    padding: EdgeInsets.only(right: 12),
                    child: Icon(Icons.check),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
