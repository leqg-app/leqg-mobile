import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/menu.dart';
import '../../store/atoms.dart';
import '../../store/store_actions.dart';
import '../../tabs.dart';
import '../../utils/error_message.dart';
import '../account/won_reputation.dart';
import '../map/map_screen.dart';
import '../store/schedules.dart';
import '../store/store_features.dart';
import '../store/store_products.dart';
import 'add_photo.dart';
import 'edit_address.dart';
import 'edit_features.dart';
import 'edit_schedules.dart';
import 'history.dart';

/// Port de src/containers/EditStore/EditStore.js : formulaire principal
/// d'ajout / modification d'un bar.
class EditStoreScreen extends ConsumerStatefulWidget {
  const EditStoreScreen({super.key});

  @override
  ConsumerState<EditStoreScreen> createState() => _EditStoreScreenState();
}

class _EditStoreScreenState extends ConsumerState<EditStoreScreen> {
  bool loading = false;
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _websiteController;

  @override
  void initState() {
    super.initState();
    final storeEdition = ref.read(storeEditionProvider);
    _nameController = TextEditingController(text: storeEdition.name);
    _phoneController = TextEditingController(text: storeEdition.phone ?? '');
    _websiteController =
        TextEditingController(text: storeEdition.website ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final storeEdition = ref.read(storeEditionProvider);
    setState(() => loading = true);
    if (storeEdition.products == null || storeEdition.products!.isEmpty) {
      setState(() => loading = false);
      _showError('Veuillez ajouter au moins une bière à la carte');
      return;
    }
    final result = await ref.read(storeActionsProvider).saveStore(storeEdition);
    if (result.error != null) {
      setState(() => loading = false);
      _showError(getErrorMessage(result.error!));
      return;
    }
    if (storeEdition.id == null && result.store != null) {
      ref.read(sheetStoreProvider.notifier).state =
          result.store!.copyWith(focus: true);
    }
    if (!mounted) {
      return;
    }
    final reputation = result.reputation ?? {};
    if ((reputation['total'] ?? 0) != 0) {
      Navigator.of(context).pushReplacement(MaterialPageRoute(
        builder: (context) => WonReputationScreen(
            reputation: reputation.cast<String, dynamic>()),
      ));
    } else {
      ref.read(contributeSnackbarProvider.notifier).state = true;
      navigateToMapTab(context, ref);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(message),
      duration: const Duration(seconds: 3),
      action: SnackBarAction(label: 'OK', onPressed: () {}),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProvider);
    final storeEdition = ref.watch(storeEditionProvider);

    final schedules = storeEdition.schedules ??
        List.generate(7, newSchedule);
    final features = storeEdition.features;

    final validAddress = storeEdition.address != null &&
        storeEdition.longitude != null &&
        storeEdition.latitude != null;
    final validForm =
        storeEdition.name.isNotEmpty && validAddress && user != null;

    final appBar = AppBar(
      title: Text(
          storeEdition.id != null ? 'Modifier un bar' : 'Ajouter un bar'),
      actions: [
        IconButton(
          icon: const Icon(Icons.check),
          onPressed: (!validForm || loading) ? null : _save,
        ),
      ],
    );

    if (loading) {
      return Scaffold(
        appBar: appBar,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (user == null) {
      return Scaffold(
        appBar: appBar,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Veuillez vous connecter pour contribuer'),
              TextButton(
                onPressed: () {
                  ref.read(sheetStoreProvider.notifier).state = null;
                  navigateToAccountTab(context, ref);
                },
                child: const Text('Connexion'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: appBar,
      body: ListView(
        padding: const EdgeInsets.only(bottom: 100),
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.manual,
        children: [
          if ((storeEdition.revisions ?? const []).isNotEmpty)
            MenuList(children: [
              MenuListItem(
                name: "Voir l'historique des modifications",
                iconData: Icons.history,
                last: true,
                onPress: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) =>
                        HistoryScreen(revisions: storeEdition.revisions!),
                  ),
                ),
              ),
            ]),
          Padding(
            padding: const EdgeInsets.only(top: 10, left: 10, right: 10),
            child: TextField(
              controller: _nameController,
              autofocus: storeEdition.id == null && storeEdition.name.isEmpty,
              textInputAction: TextInputAction.done,
              onChanged: (name) => ref
                  .read(storeEditionProvider.notifier)
                  .state = storeEdition.copyWith(name: name),
              decoration: const InputDecoration(
                labelText: 'Nom',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          _EditCard(
            title: 'Adresse',
            children: [
              Text(validAddress
                  ? storeEdition.address!
                  : 'Aucune adresse renseignée pour le moment'),
              Padding(
                padding: const EdgeInsets.only(top: 20),
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (context) => const EditAddressScreen()),
                  ),
                  child: Text(
                      "${validAddress ? 'Modifier' : 'Préciser'} l'adresse"),
                ),
              ),
            ],
          ),
          _EditCard(
            title: 'Carte des bières',
            children: [
              Padding(
                padding: const EdgeInsets.only(bottom: 15),
                child: Text(storeEdition.id != null
                    ? '${storeEdition.products?.length ?? 0} bière(s) ajoutée(s)'
                    : 'La carte sera modifiable après avoir créé le bar'),
              ),
              OutlinedButton(
                onPressed: storeEdition.id == null
                    ? null
                    : () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => StoreProductsScreen(
                              storeId: storeEdition.id!,
                              initialEditMode: true,
                            ),
                          ),
                        ),
                child: const Text('Modifier le menu'),
              ),
            ],
          ),
          _EditCard(
            title: 'Horaires',
            children: [
              if (schedules.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(bottom: 15),
                  child: Text('Aucun horaire renseigné pour le moment'),
                )
              else
                GestureDetector(
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (context) => const EditSchedulesScreen()),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Schedules(schedules: schedules),
                  ),
                ),
              OutlinedButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(
                      builder: (context) => const EditSchedulesScreen()),
                ),
                child: const Text('Modifier les horaires'),
              ),
            ],
          ),
          _EditCard(
            title: 'Caractéristiques',
            children: [
              if (features.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(bottom: 15),
                  child: Text('Aucune caractéristique pour le moment'),
                )
              else
                GestureDetector(
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (context) => const EditFeaturesScreen()),
                  ),
                  child: StoreFeatures(features: features),
                ),
              OutlinedButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(
                      builder: (context) => const EditFeaturesScreen()),
                ),
                child: const Text('Modifier les caractéristiques'),
              ),
            ],
          ),
          if (storeEdition.id != null)
            _EditCard(
              title: 'Photos',
              children: [
                const Padding(
                  padding: EdgeInsets.only(bottom: 15),
                  child: Text('Ajoutez des photos pour illustrer ce bar'),
                ),
                OutlinedButton.icon(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (context) => const AddPhotoScreen()),
                  ),
                  icon: const Icon(Icons.camera_alt, size: 18),
                  label: const Text('Ajouter une photo'),
                ),
              ],
            ),
          _EditCard(
            title: 'Autres informations',
            children: [
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.done,
                onChanged: (phone) => ref
                    .read(storeEditionProvider.notifier)
                    .state = storeEdition.copyWith(phone: phone),
                decoration: const InputDecoration(labelText: 'Téléphone'),
              ),
              TextField(
                controller: _websiteController,
                keyboardType: TextInputType.url,
                textInputAction: TextInputAction.done,
                onChanged: (website) => ref
                    .read(storeEditionProvider.notifier)
                    .state = storeEdition.copyWith(website: website),
                decoration:
                    const InputDecoration(labelText: 'Site internet'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EditCard extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _EditCard({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Card.outlined(
      margin: const EdgeInsets.only(top: 10, left: 10, right: 10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(title, style: const TextStyle(fontSize: 18)),
            ),
            ...children,
          ],
        ),
      ),
    );
  }
}
