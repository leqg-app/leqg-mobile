import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/action_buttons.dart';
import '../../components/dialogs.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../tabs.dart';
import '../edit_store/edit_store.dart';

/// État de création d'un bar (≙ createStore local de Mapbox.js).
class CreateStoreState {
  final bool loading;
  final bool add;
  final String? error;
  final String? address;
  final String? countryCode;
  final double? longitude;
  final double? latitude;

  const CreateStoreState({
    this.loading = false,
    this.add = false,
    this.error,
    this.address,
    this.countryCode,
    this.longitude,
    this.latitude,
  });
}

final createStoreProvider = StateProvider<CreateStoreState?>((ref) => null);

String _getStateText(CreateStoreState? createStore) {
  if (createStore == null) {
    return '';
  }
  if (createStore.error != null) {
    return createStore.error!;
  }
  if (createStore.loading) {
    return 'Chargement...';
  }
  if (createStore.add) {
    return 'Cliquez longuement sur la carte pour sélectionner le lieu du bar';
  }
  return createStore.address ?? '';
}

/// Port de src/containers/Map/CreateStoreSheet.js : bottom sheet non modale
/// « Ajouter un nouveau bar ».
class CreateStoreSheet extends ConsumerWidget {
  const CreateStoreSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final createStore = ref.watch(createStoreProvider);
    final colors = Theme.of(context).colorScheme;

    void close() {
      ref.read(createStoreProvider.notifier).state = null;
    }

    void submit() {
      final user = ref.read(userProvider);
      if (user == null) {
        showLoginRequiredDialog(
          context,
          message: 'Vous devez être connecté pour ajouter un nouveau bar',
          onLogin: () {
            navigateToAccountTab(context, ref);
            close();
          },
        );
        return;
      }
      ref.read(storeEditionProvider.notifier).state = StoreEdition(
        address: createStore?.address,
        countryCode: createStore?.countryCode,
        longitude: createStore?.longitude,
        latitude: createStore?.latitude,
      );
      Navigator.of(context, rootNavigator: true).push(
        MaterialPageRoute(builder: (context) => const EditStoreScreen()),
      );
    }

    return AnimatedSlide(
      offset: createStore == null ? const Offset(0, 1) : Offset.zero,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
      child: Align(
        alignment: Alignment.bottomCenter,
        child: Material(
          color: colors.surface,
          borderRadius:
              const BorderRadius.vertical(top: Radius.circular(15)),
          elevation: 8,
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32,
                    height: 4,
                    margin: const EdgeInsets.only(top: 10),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: colors.onSurfaceVariant,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text('Ajouter un nouveau bar',
                      style: Theme.of(context).textTheme.titleLarge),
                  Text(_getStateText(createStore)),
                  ActionButtons(
                    onCancel: close,
                    onSubmit: submit,
                    submitLabel: 'Ajouter',
                    disabled: createStore?.address == null,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
