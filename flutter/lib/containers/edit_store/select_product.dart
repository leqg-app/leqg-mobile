import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../store/atoms.dart';

/// Résultat de la sélection d'une bière (id du catalogue ou nom libre).
class ProductSelection {
  final int? productId;
  final String? productName;

  const ProductSelection({this.productId, this.productName});
}

/// Port de src/containers/EditStore/SelectProduct.js.
class SelectProductScreen extends ConsumerStatefulWidget {
  final bool replacingProduct;

  const SelectProductScreen({super.key, this.replacingProduct = false});

  @override
  ConsumerState<SelectProductScreen> createState() =>
      _SelectProductScreenState();
}

class _SelectProductScreenState extends ConsumerState<SelectProductScreen> {
  String search = '';
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance
        .addPostFrameCallback((_) => _focusNode.requestFocus());
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  void _onSelect({int? productId}) {
    Navigator.of(context).pop(ProductSelection(
      productId: productId,
      productName: productId == null ? search : null,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(productsProvider);

    final filteredProducts = search.isEmpty
        ? ([...products]..sort((a, b) => a.name.compareTo(b.name)))
        : (products
            .where((product) =>
                product.name.toLowerCase().contains(search.toLowerCase()))
            .toList()
          ..sort((a, b) => a.name.compareTo(b.name)));

    const rowBorder = Border(
      bottom: BorderSide(color: Color(0x1F000000), width: 0.5),
    );

    return Scaffold(
      appBar: AppBar(
          title: Text(widget.replacingProduct
              ? 'Modifier une bière'
              : 'Ajouter une bière')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8),
            child: TextField(
              focusNode: _focusNode,
              onChanged: (value) => setState(() => search = value),
              decoration: const InputDecoration(
                hintText: 'Nommer ou rechercher une bière',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
            ),
          ),
          if (search.isNotEmpty)
            InkWell(
              onTap: () => _onSelect(),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(border: rowBorder),
                child: Text('Ajouter "$search"',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          Expanded(
            child: ListView.builder(
              keyboardDismissBehavior:
                  ScrollViewKeyboardDismissBehavior.manual,
              itemCount: filteredProducts.length,
              itemBuilder: (context, index) {
                final product = filteredProducts[index];
                return InkWell(
                  onTap: () => _onSelect(productId: product.id),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(border: rowBorder),
                    child: Text(product.name),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
