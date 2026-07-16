import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/action_buttons.dart';
import '../../../components/filter_chip.dart';
import '../../../components/products_list.dart';
import '../../../models/models.dart';
import '../../../store/atoms.dart';
import '../../../store/filter_atoms.dart';

/// Port de src/containers/Map/Filters/ProductFilter.js.
String _getFilterName(ProductFilter filter) {
  final products = filter.products;
  if (products.isEmpty) {
    return 'Bière';
  }
  if (products.length == 1) {
    return products[0].name;
  }
  return '${products.length} bières';
}

class ProductFilterButton extends ConsumerWidget {
  const ProductFilterButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productFilter = ref.watch(productFilterProvider);

    void reset() {
      ref.read(productFilterProvider.notifier).state =
          ProductFilter(products: const [], filterAll: productFilter.filterAll);
    }

    return MapFilterChip(
      icon: Icons.sports_bar_outlined,
      label: _getFilterName(productFilter),
      onPress: () {
        ref.read(sheetStoreProvider.notifier).state = null;
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          useSafeArea: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
          ),
          backgroundColor: Theme.of(context).colorScheme.surface,
          builder: (context) => const FractionallySizedBox(
            heightFactor: 0.9,
            child: _ProductFilterSheet(),
          ),
        );
      },
      onRemove: productFilter.products.isNotEmpty ? reset : null,
    );
  }
}

class _ProductFilterSheet extends ConsumerStatefulWidget {
  const _ProductFilterSheet();

  @override
  ConsumerState<_ProductFilterSheet> createState() =>
      _ProductFilterSheetState();
}

class _ProductFilterSheetState extends ConsumerState<_ProductFilterSheet> {
  String search = '';
  bool filterAll = false;
  List<Product> selectedProducts = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(productsProvider);

    final productsFiltered = search.isEmpty
        ? ([...products]..sort((a, b) => a.name.compareTo(b.name)))
        : (products
            .where((p) => p.name.toLowerCase().contains(search))
            .toList()
          ..sort((a, b) => a.name.compareTo(b.name)));

    void unselectProduct(Product toRemove) {
      setState(() {
        selectedProducts =
            selectedProducts.where((p) => p.id != toRemove.id).toList();
      });
    }

    void submit() {
      ref.read(productFilterProvider.notifier).state = ProductFilter(
        products: selectedProducts,
        filterAll: filterAll,
      );
      Navigator.of(context).pop();
    }

    void toggleType() => setState(() => filterAll = !filterAll);

    return Padding(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(
                left: 12, right: 12, top: 10, bottom: 12),
            child: TextField(
              controller: _searchController,
              onChanged: (keywords) =>
                  setState(() => search = keywords.toLowerCase()),
              decoration: InputDecoration(
                hintText: 'Rechercher une bière',
                filled: true,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 7),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ProductsList(
              products: productsFiltered,
              selected: selectedProducts,
              onToggle: (product) {
                setState(() {
                  if (selectedProducts.any((p) => p.id == product.id)) {
                    selectedProducts = selectedProducts
                        .where((p) => p.id != product.id)
                        .toList();
                  } else {
                    selectedProducts = [...selectedProducts, product];
                  }
                });
              },
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Colors.grey, width: 0.5)),
            ),
            child: SafeArea(
              top: false,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (selectedProducts.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.only(top: 10),
                      height: 50,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          for (final product in selectedProducts)
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 5),
                              child: InputChip(
                                label: Text(product.name),
                                onPressed: () => unselectProduct(product),
                                onDeleted: () => unselectProduct(product),
                              ),
                            ),
                        ],
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.only(
                        left: 10, right: 10, top: 15),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: toggleType,
                          child: const Text(
                              'Tous les critères doivent être présents:'),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 10),
                          child: Switch(
                            value: filterAll,
                            onChanged: (_) => toggleType(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  ActionButtons(
                    onCancel: () => Navigator.of(context).pop(),
                    onSubmit: submit,
                    submitLabel: 'OK',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
