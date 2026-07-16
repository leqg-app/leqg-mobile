import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/features_list.dart';
import '../../store/atoms.dart';

/// Port de src/containers/EditStore/EditFeatures.js.
class EditFeaturesScreen extends ConsumerWidget {
  const EditFeaturesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storeEdition = ref.watch(storeEditionProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Modifier les caractéristiques'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(15),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Colors.grey, width: 0.5),
              ),
            ),
            child: const Text(
              'Sélectionnez des caractéristiques décrivant au mieux ce lieu',
              style: TextStyle(fontSize: 15),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding:
                  const EdgeInsets.only(left: 15, right: 15, bottom: 15),
              child: FeaturesList(
                selected: storeEdition.features,
                onChange: (features) => ref
                    .read(storeEditionProvider.notifier)
                    .state = storeEdition.copyWith(features: features),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
