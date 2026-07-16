import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/dialogs.dart';
import '../../components/price.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../store/store_actions.dart';
import '../../tabs.dart';
import '../../utils/error_message.dart';
import '../../utils/price.dart';
import '../edit_store/edit_product.dart';
import '../edit_store/select_product.dart';

/// Port de src/containers/Store/StoreProducts*.js : carte des bières d'un
/// bar, avec mode édition.
const _types = {
  'draft': 'Pression',
  'bottle': 'Bouteille',
};

class StoreProductsScreen extends ConsumerStatefulWidget {
  final int storeId;
  final bool initialEditMode;

  const StoreProductsScreen({
    super.key,
    required this.storeId,
    this.initialEditMode = false,
  });

  @override
  ConsumerState<StoreProductsScreen> createState() =>
      _StoreProductsScreenState();
}

class _StoreProductsScreenState extends ConsumerState<StoreProductsScreen> {
  late bool editMode = widget.initialEditMode;
  bool isSaving = false;

  void _toggleEditMode(Store store) {
    final user = ref.read(userProvider);
    if (user == null) {
      showLoginRequiredDialog(
        context,
        message: 'Vous devez être connecté pour modifier ce bar',
        onLogin: () => navigateToAccountTab(context, ref),
      );
      return;
    }
    if (!editMode) {
      ref.read(storeEditionProvider.notifier).state =
          StoreEdition.fromStore(store);
      setState(() => editMode = true);
    }
  }

  Future<void> _validateChanges(Store store) async {
    final storeEdition = ref.read(storeEditionProvider);
    final originalProducts =
        (store.products ?? const []).map((p) => p.toJson()).toList();
    final editedProducts =
        (storeEdition.products ?? const []).map((p) => p.toJson()).toList();

    if (storeEdition.id == store.id &&
        storeEdition.products != null &&
        editedProducts.toString() != originalProducts.toString()) {
      setState(() => isSaving = true);
      final result =
          await ref.read(storeActionsProvider).saveStore(storeEdition);
      if (result.error != null) {
        setState(() => isSaving = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(getErrorMessage(result.error!)),
            duration: const Duration(seconds: 3),
            action: SnackBarAction(label: 'OK', onPressed: () {}),
          ));
        }
        return;
      }
    }
    setState(() {
      editMode = false;
      isSaving = false;
    });
  }

  Future<void> _navigateToAddProduct() async {
    final selection = await Navigator.of(context).push<ProductSelection>(
      MaterialPageRoute(builder: (context) => const SelectProductScreen()),
    );
    if (selection == null || !mounted) {
      return;
    }
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => EditProductScreen(
          productId: selection.productId,
          productName: selection.productName,
        ),
      ),
    );
    setState(() {});
  }

  Future<void> _onProductPress(EditingProduct product) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => EditProductScreen(product: product),
      ),
    );
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final products = ref.watch(productsProvider);
    final storeAsync = ref.watch(storeDetailProvider(widget.storeId));
    final storeEdition = ref.watch(storeEditionProvider);
    final store = storeAsync.valueOrNull;

    final storeProducts = editMode
        ? (storeEdition.products ?? store?.products ?? const <StoreProduct>[])
        : (store?.products ?? const <StoreProduct>[]);

    final hasHH = storeProducts.any((product) =>
        product.specialPrice != null && product.specialPrice != 0);

    // Groupement par type puis par produit (≙ groupByType)
    final sorted = [...storeProducts]
      ..sort(sortByPrices)
      ..sort((a, b) => a.type == 'draft' ? -1 : 1);
    final productsByTypes = <String, Map<String, List<StoreProduct>>>{};
    for (final product in sorted) {
      final type = product.type ?? 'draft';
      final id = product.productId?.toString() ??
          (product.productName ?? '').trim();
      productsByTypes.putIfAbsent(type, () => {});
      productsByTypes[type]!.putIfAbsent(id, () => []);
      productsByTypes[type]![id]!.add(product);
    }

    const rowBorder = Border(
      bottom: BorderSide(color: Color(0xFFDDDDDD), width: 0.5),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Carte'),
        actions: [
          if (store != null)
            editMode
                ? IconButton(
                    icon: const Icon(Icons.check),
                    onPressed: isSaving ? null : () => _validateChanges(store),
                  )
                : IconButton(
                    icon: const Icon(Icons.edit),
                    onPressed: () => _toggleEditMode(store),
                  ),
        ],
      ),
      floatingActionButton: editMode
          ? FloatingActionButton(
              backgroundColor: colors.surface,
              foregroundColor: colors.primary,
              onPressed: _navigateToAddProduct,
              child: const Icon(Icons.add),
            )
          : null,
      body: Stack(
        children: [
          ListView(
            children: [
              Container(
                height: 55,
                padding: const EdgeInsets.only(left: 15, right: 10),
                alignment: Alignment.centerLeft,
                decoration: const BoxDecoration(border: rowBorder),
                child: const Text('Bières',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              for (final type in productsByTypes.keys) ...[
                Container(
                  constraints: const BoxConstraints(minHeight: 45),
                  padding: const EdgeInsets.only(
                      left: 15, right: 10, top: 8, bottom: 8),
                  decoration: const BoxDecoration(border: rowBorder),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_types[type] ?? 'Autre',
                          style:
                              const TextStyle(fontWeight: FontWeight.bold)),
                      if (hasHH)
                        const Row(
                          children: [
                            SizedBox(
                                width: 50,
                                child: Padding(
                                  padding: EdgeInsets.only(left: 10),
                                  child: Text('Prix'),
                                )),
                            SizedBox(
                                width: 50,
                                child: Padding(
                                  padding: EdgeInsets.only(left: 10),
                                  child: Text('HH.'),
                                )),
                          ],
                        ),
                    ],
                  ),
                ),
                for (final group in productsByTypes[type]!.values)
                  for (var priceIndex = 0;
                      priceIndex < group.length;
                      priceIndex++)
                    Builder(builder: (context) {
                      final priceItem = group[priceIndex];
                      Product? productDetail;
                      for (final p in products) {
                        if (p.id == priceItem.productId) {
                          productDetail = p;
                          break;
                        }
                      }
                      return InkWell(
                        onTap: editMode
                            ? () => _onProductPress(EditingProduct(
                                  storeProduct: priceItem,
                                  product: productDetail,
                                ))
                            : null,
                        child: Container(
                          constraints: const BoxConstraints(minHeight: 45),
                          padding: const EdgeInsets.only(
                              left: 15, right: 10, top: 8, bottom: 8),
                          decoration:
                              const BoxDecoration(border: rowBorder),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  priceIndex == 0
                                      ? (productDetail?.name ??
                                          priceItem.productName ??
                                          'Bière')
                                      : '',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text('${priceItem.volume}cl'),
                              SizedBox(
                                width: 60,
                                child: Padding(
                                  padding: const EdgeInsets.only(left: 10),
                                  child: priceItem.price != null
                                      ? PriceText(
                                          amount: priceItem.price,
                                          currency: priceItem.currencyCode)
                                      : const Text('-'),
                                ),
                              ),
                              if (hasHH)
                                SizedBox(
                                  width: 60,
                                  child: Padding(
                                    padding:
                                        const EdgeInsets.only(left: 10),
                                    child: priceItem.specialPrice != null &&
                                            priceItem.specialPrice != 0
                                        ? PriceText(
                                            amount: priceItem.specialPrice,
                                            currency:
                                                priceItem.currencyCode)
                                        : const Text(' '),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    }),
              ],
            ],
          ),
          if (isSaving)
            Container(
              color: Colors.black54,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(),
                      Padding(
                        padding: EdgeInsets.only(top: 10),
                        child: Text('Sauvegarde en cours...'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
