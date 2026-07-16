import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/action_buttons.dart';
import '../../../components/features_list.dart';
import '../../../components/filter_chip.dart';
import '../../../store/atoms.dart';
import '../../../store/filter_atoms.dart';

/// Port de src/containers/Map/Filters/FeatureFilter.js.
class FeatureFilter extends ConsumerWidget {
  const FeatureFilter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featureFilter = ref.watch(featureFilterProvider);

    return MapFilterChip(
      label: 'Caractéristique',
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
            heightFactor: 0.8,
            child: _FeatureFilterSheet(),
          ),
        );
      },
      onRemove: featureFilter != null
          ? () => ref.read(featureFilterProvider.notifier).state = null
          : null,
    );
  }
}

class _FeatureFilterSheet extends ConsumerStatefulWidget {
  const _FeatureFilterSheet();

  @override
  ConsumerState<_FeatureFilterSheet> createState() =>
      _FeatureFilterSheetState();
}

class _FeatureFilterSheetState extends ConsumerState<_FeatureFilterSheet> {
  List<int> filters = [];

  @override
  Widget build(BuildContext context) {
    void submit() {
      ref.read(featureFilterProvider.notifier).state =
          filters.isNotEmpty ? filters : null;
      Navigator.of(context).pop();
    }

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 15),
            child: FeaturesList(
              selected: filters,
              onChange: (selected) => setState(() => filters = selected),
            ),
          ),
        ),
        Container(
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: Colors.grey, width: 0.5)),
          ),
          child: SafeArea(
            top: false,
            child: ActionButtons(
              onCancel: () => Navigator.of(context).pop(),
              onSubmit: submit,
              submitLabel: 'OK',
            ),
          ),
        ),
      ],
    );
  }
}
