import 'package:flutter/material.dart';

/// Port de src/components/Badge.js : chip sélectionnable.
class SelectableBadge extends StatelessWidget {
  final bool selected;
  final VoidCallback onSelect;
  final String label;

  const SelectableBadge({
    super.key,
    required this.selected,
    required this.onSelect,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(right: 10, bottom: 10),
      child: ActionChip(
        onPressed: onSelect,
        backgroundColor: selected ? colors.primary : null,
        labelStyle: TextStyle(color: selected ? colors.onPrimary : null),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: colors.outline.withValues(alpha: 0.5)),
        ),
        label: Text(label),
      ),
    );
  }
}
