import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../store/atoms.dart';

/// Port de src/containers/Store/StoreFeatures.js : chips des caractéristiques
/// du bar.
class StoreFeatures extends ConsumerWidget {
  final List<int> features;

  const StoreFeatures({super.key, required this.features});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featureGroups = ref.watch(featuresProvider);

    if (featureGroups.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Wrap(
        children: [
          for (final group in featureGroups)
            for (final feature in group.features)
              if (features.contains(feature.id))
                Padding(
                  padding: const EdgeInsets.only(right: 10, bottom: 10),
                  child: Chip(label: Text(feature.name)),
                ),
        ],
      ),
    );
  }
}
