import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../store/atoms.dart';
import 'badge.dart';

/// Port de src/components/FeaturesList.js : groupes de caractéristiques
/// sélectionnables.
class FeaturesList extends ConsumerWidget {
  final List<int> selected;
  final void Function(List<int> selected) onChange;

  const FeaturesList({
    super.key,
    required this.selected,
    required this.onChange,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featureGroups = ref.watch(featuresProvider);

    void onSelect(int id) {
      if (selected.contains(id)) {
        onChange(selected.where((f) => f != id).toList());
      } else {
        onChange([...selected, id]);
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final group in featureGroups) ...[
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Text(group.name,
                style: Theme.of(context).textTheme.titleLarge),
          ),
          Wrap(
            children: [
              for (final feature in group.features)
                SelectableBadge(
                  selected: selected.contains(feature.id),
                  onSelect: () => onSelect(feature.id),
                  label: feature.name,
                ),
            ],
          ),
        ],
      ],
    );
  }
}
