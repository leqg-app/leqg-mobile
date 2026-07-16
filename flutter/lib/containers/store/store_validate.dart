import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/stores.dart' as stores_api;
import '../../components/dialogs.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../tabs.dart';
import '../../utils/coordinates.dart';
import '../../utils/error_message.dart';
import '../../utils/location.dart';
import '../account/won_reputation.dart';

const _errorMessages = {
  'position.blocked':
      'La géolocalisation est nécessaire pour cette fonctionnalité',
  'position.denied':
      'La géolocalisation est nécessaire pour cette fonctionnalité',
  'store.validation.position':
      'Vous êtes trop éloigné de ce lieu pour le valider, rapprochez-vous !',
  'store.validation.already': 'Vous avez déjà validé ce lieu, merci encore !',
  'store.validation.ratelimit':
      'Vous êtes trop rapide, attendez un peu avant de valider un nouveau lieu',
};

/// Port de src/containers/Store/StoreValidate.js : bouton « J'y suis ».
class StoreValidate extends ConsumerStatefulWidget {
  final Store store;

  const StoreValidate({super.key, required this.store});

  @override
  ConsumerState<StoreValidate> createState() => _StoreValidateState();
}

class _StoreValidateState extends ConsumerState<StoreValidate> {
  bool loading = false;

  Future<void> _validate() async {
    final store = widget.store;
    final user = ref.read(userProvider);
    if (user == null) {
      showLoginRequiredDialog(
        context,
        message: 'Vous devez être connecté pour valider ce bar',
        onLogin: () {
          navigateToAccountTab(context, ref);
          ref.read(sheetStoreProvider.notifier).state = null;
        },
      );
      return;
    }

    setState(() => loading = true);
    try {
      final position =
          await getLocation(timeout: 5000, askedByUser: true, context: context);
      final longitude = position[0];
      final latitude = position[1];
      final distance = getCoordinatesDistance(
        latitude1: latitude,
        longitude1: longitude,
        latitude2: store.latitude,
        longitude2: store.longitude,
      );
      if (distance > 0.04) {
        throw 'store.validation.position';
      }
      final response = await stores_api.validateStore(
          store.id, {'longitude': longitude, 'latitude': latitude}, user.jwt);
      setState(() => loading = false);
      ref.read(storeDetailProvider(store.id).notifier).set(store.copyWith(
            validations: [
              ...store.validations ?? [],
              {
                'user': {'id': user.id}
              },
            ],
          ));
      if (mounted) {
        Navigator.of(context, rootNavigator: true).push(MaterialPageRoute(
          builder: (context) => WonReputationScreen(
              reputation: (response['reputation'] as Map?)
                      ?.cast<String, dynamic>() ??
                  {}),
        ));
      }
    } catch (err) {
      setState(() => loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(getErrorMessage(err, _errorMessages)),
          duration: const Duration(seconds: 3),
          action: SnackBarAction(label: 'OK', onPressed: () {}),
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = widget.store;
    final user = ref.watch(userProvider);

    if (store.validations == null) {
      return const SizedBox.shrink();
    }

    final alreadyValidated = store.validations!.any((validation) =>
        validation is Map &&
        validation['user'] is Map &&
        validation['user']['id'] == user?.id);

    if (alreadyValidated) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 30),
        child: OutlinedButton.icon(
          onPressed: null,
          icon: const Icon(Icons.check),
          label: const Text('Validé'),
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 30),
          child: OutlinedButton(
            onPressed: loading ? null : _validate,
            child: loading
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2))
                : const Text("J'y suis"),
          ),
        ),
        const Padding(
          padding: EdgeInsets.only(bottom: 10, left: 20, right: 20),
          child: Text(
            'En validant votre position à ce bar, vous remerciez les contributeurs qui ont participé à la création de cette page.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey, fontSize: 12),
          ),
        ),
      ],
    );
  }
}
