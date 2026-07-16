import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/assets_data.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../theme.dart';
import '../../utils/price.dart';
import 'select_currency.dart';
import 'select_product.dart';

/// Produit en cours d'édition (storeProduct + fiche produit du catalogue).
class EditingProduct {
  final StoreProduct storeProduct;
  final Product? product;

  const EditingProduct({required this.storeProduct, this.product});
}

class _Variant {
  int? id;
  String? tmpId;
  String type;
  String volume;
  String price;
  String specialPrice;

  _Variant({
    this.id,
    this.tmpId,
    this.type = 'draft',
    this.volume = '50',
    this.price = '',
    this.specialPrice = '',
  });
}

/// Port de src/containers/EditStore/EditProduct.js : édition des variantes
/// (type, volume, prix, happy hour) d'une bière.
class EditProductScreen extends ConsumerStatefulWidget {
  final EditingProduct? product;
  final int? productId;
  final String? productName;

  const EditProductScreen(
      {super.key, this.product, this.productId, this.productName});

  @override
  ConsumerState<EditProductScreen> createState() => _EditProductScreenState();
}

class _EditProductScreenState extends ConsumerState<EditProductScreen> {
  int? productId;
  String productName = '';
  late String currencyCode;
  List<_Variant> variants = [];
  late final TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    final storeEdition = ref.read(storeEditionProvider);
    currencyCode =
        (AssetsData.countries[storeEdition.countryCode ?? 'FR'] ?? 'EUR')
            as String;

    if (widget.product != null) {
      // Édition : regrouper toutes les variantes du même produit
      final product = widget.product!.storeProduct;
      final sameProductVariants =
          (storeEdition.products ?? const <StoreProduct>[]).where((p) {
        if (product.productId != null) {
          return p.productId == product.productId;
        }
        return (p.productName ?? '').trim() ==
            (product.productName ?? '').trim();
      });

      productId = widget.product!.product?.id ?? product.productId;
      productName = product.productName ?? '';
      currencyCode = product.currencyCode ?? currencyCode;
      variants = sameProductVariants
          .map((v) => _Variant(
                id: v.id,
                tmpId: v.tmpId,
                type: v.type ?? 'draft',
                volume: '${v.volume ?? ''}',
                price: displayPrice(v.price),
                specialPrice: displayPrice(v.specialPrice),
              ))
          .toList();
    } else if (widget.productId != null) {
      productId = widget.productId;
      variants = [_Variant()];
    } else if (widget.productName != null) {
      productName = widget.productName!.trim();
      variants = [_Variant()];
    }

    _nameController = TextEditingController(text: productName);
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _updateVariantType(int index, String type) {
    setState(() {
      variants[index].type = type;
      // Volume par défaut selon le type
      variants[index].volume = type == 'draft' ? '50' : '33';
    });
  }

  void _addVariant() {
    final lastVariant = variants.last;
    var volume = lastVariant.volume;
    double? price;
    if (lastVariant.type == 'draft') {
      final lastPrice = parsePrice(lastVariant.price);
      if (int.tryParse(volume) == 50) {
        volume = '25';
        if (lastPrice != null) {
          price = (lastPrice * 0.5 * 10).ceil() / 10;
        }
      } else if (int.tryParse(volume) == 25) {
        volume = '50';
        if (lastPrice != null) {
          price = (lastPrice * 2 * 10).floor() / 10;
        }
      }
    }

    setState(() {
      variants.add(_Variant(
        volume: volume,
        price: price != null ? displayPrice(price) : '',
      ));
    });
  }

  void _removeVariant(int index) {
    if (variants.length == 1) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Erreur'),
          content: const Text('Vous devez conserver au moins un produit.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return;
    }

    final variant = variants[index];
    if (variant.price.isEmpty || variant.specialPrice.isEmpty) {
      setState(() => variants.removeAt(index));
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmation'),
        content: const Text('Voulez-vous vraiment supprimer ce produit ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              setState(() => variants.removeAt(index));
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  bool get _validForm =>
      (productId != null || productName.isNotEmpty) &&
      variants.isNotEmpty &&
      variants.every((v) =>
          v.volume.isNotEmpty && (parsePrice(v.price) ?? 0) > 0);

  List<StoreProduct> _remainingProducts(StoreEdition storeEdition) {
    return (storeEdition.products ?? const <StoreProduct>[]).where((p) {
      if (productId != null) {
        return p.productId != productId;
      }
      return (p.productName ?? '').trim() != productName.trim();
    }).toList();
  }

  void _save() {
    if (!_validForm) {
      return;
    }
    final storeEdition = ref.read(storeEditionProvider);
    final remainingProducts = _remainingProducts(storeEdition);

    final random = Random();
    remainingProducts.addAll(variants.map((variant) => StoreProduct(
          id: variant.id,
          tmpId: variant.tmpId ??
              (variant.id == null
                  ? random.nextDouble().toStringAsFixed(10)
                  : null),
          productId: productId,
          productName: productName,
          type: variant.type,
          volume: num.tryParse(variant.volume),
          price: parsePrice(variant.price),
          specialPrice: parsePrice(variant.specialPrice),
          currencyCode: currencyCode,
        )));

    ref.read(storeEditionProvider.notifier).state =
        storeEdition.copyWith(products: remainingProducts);
    Navigator.of(context).pop();
  }

  void _removeProduct() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmation'),
        content: const Text('Voulez-vous vraiment supprimer ce produit ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              final storeEdition = ref.read(storeEditionProvider);
              ref.read(storeEditionProvider.notifier).state =
                  storeEdition.copyWith(
                      products: _remainingProducts(storeEdition));
              Navigator.of(this.context).pop();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _replaceProduct() async {
    final selection = await Navigator.of(context).push<ProductSelection>(
      MaterialPageRoute(
          builder: (context) =>
              const SelectProductScreen(replacingProduct: true)),
    );
    if (selection == null) {
      return;
    }
    setState(() {
      if (selection.productId != null) {
        productId = selection.productId;
        productName = '';
      } else if (selection.productName != null) {
        productId = null;
        productName = selection.productName!.trim();
      }
      _nameController.text = productName;
    });
  }

  Future<void> _selectCurrency() async {
    final code = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (context) => const SelectCurrencyScreen()),
    );
    if (code != null) {
      setState(() => currencyCode = code);
    }
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(productsProvider);
    final colors = Theme.of(context).colorScheme;

    Product? selectedProduct;
    for (final product in products) {
      if (product.id == productId) {
        selectedProduct = product;
        break;
      }
    }

    const headerStyle = TextStyle(
        fontWeight: FontWeight.bold, fontSize: 12);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Modifier une bière'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _validForm ? _save : null,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Expanded(
                child: selectedProduct != null
                    ? InkWell(
                        onTap: _replaceProduct,
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            border:
                                Border.all(color: const Color(0xFFDDDDDD)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment:
                                MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(selectedProduct.name,
                                    style: const TextStyle(fontSize: 17)),
                              ),
                              const Icon(Icons.edit, size: 20),
                            ],
                          ),
                        ),
                      )
                    : TextField(
                        controller: _nameController,
                        onChanged: (value) =>
                            setState(() => productName = value),
                        decoration: InputDecoration(
                          hintText: 'Nom du produit',
                          border: const OutlineInputBorder(),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.edit, size: 20),
                            onPressed: _replaceProduct,
                          ),
                        ),
                      ),
              ),
              InkWell(
                onTap: _selectCurrency,
                borderRadius: BorderRadius.circular(6),
                child: Container(
                  margin: const EdgeInsets.only(left: 12),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFCCCCCC)),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    AssetsData.currencySymbol(currencyCode),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // En-tête du tableau des variantes
          Container(
            padding:
                const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            decoration: BoxDecoration(
              color: colors.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Row(
              children: [
                SizedBox(
                    width: 50,
                    child: Text('Type',
                        textAlign: TextAlign.center, style: headerStyle)),
                SizedBox(
                    width: 90,
                    child: Text('Vol.',
                        textAlign: TextAlign.center, style: headerStyle)),
                Expanded(
                    child: Text('Prix',
                        textAlign: TextAlign.center, style: headerStyle)),
                Expanded(
                    child: Text('HH',
                        textAlign: TextAlign.center, style: headerStyle)),
                SizedBox(width: 40),
              ],
            ),
          ),
          const SizedBox(height: 8),
          for (var index = 0; index < variants.length; index++)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  SizedBox(
                    width: 50,
                    child: PopupMenuButton<String>(
                      onSelected: (type) => _updateVariantType(index, type),
                      itemBuilder: (context) => [
                        PopupMenuItem(
                          value: 'draft',
                          child: Row(children: [
                            if (variants[index].type == 'draft')
                              const Icon(Icons.check, size: 18),
                            const SizedBox(width: 6),
                            const Text('Pression'),
                          ]),
                        ),
                        PopupMenuItem(
                          value: 'bottle',
                          child: Row(children: [
                            if (variants[index].type == 'bottle')
                              const Icon(Icons.check, size: 18),
                            const SizedBox(width: 6),
                            const Text('Bouteille'),
                          ]),
                        ),
                      ],
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFDDDDDD)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Icon(
                          variants[index].type == 'draft'
                              ? Icons.sports_bar
                              : Icons.liquor,
                          size: 22,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 90,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: TextFormField(
                        initialValue: variants[index].volume,
                        onChanged: (value) => variants[index].volume = value,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          suffixText: 'cl',
                          isDense: true,
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: TextFormField(
                        initialValue: variants[index].price,
                        autofocus: index == 0 &&
                            (widget.productId != null ||
                                widget.productName != null),
                        onChanged: (value) {
                          variants[index].price = value;
                          setState(() {});
                        },
                        keyboardType: const TextInputType.numberWithOptions(
                            decimal: true),
                        decoration: const InputDecoration(isDense: true),
                      ),
                    ),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: TextFormField(
                        initialValue: variants[index].specialPrice,
                        onChanged: (value) =>
                            variants[index].specialPrice = value,
                        keyboardType: const TextInputType.numberWithOptions(
                            decimal: true),
                        decoration: const InputDecoration(isDense: true),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 40,
                    child: variants.length > 1
                        ? IconButton(
                            icon: const Icon(Icons.delete_outline, size: 20),
                            onPressed: () => _removeVariant(index),
                          )
                        : null,
                  ),
                ],
              ),
            ),
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 16),
            child: OutlinedButton.icon(
              onPressed: _addVariant,
              icon: const Icon(Icons.add),
              label: const Text('Ajouter'),
            ),
          ),
          if (variants.any((v) => v.id != null || v.tmpId != null))
            Padding(
              padding: const EdgeInsets.only(top: 8, bottom: 20),
              child: FilledButton(
                style: FilledButton.styleFrom(backgroundColor: dangerColor),
                onPressed: _removeProduct,
                child: const Text('Supprimer le produit'),
              ),
            ),
        ],
      ),
    );
  }
}
