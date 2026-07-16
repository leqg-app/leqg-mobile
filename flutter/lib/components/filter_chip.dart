import 'package:flutter/material.dart';

/// Port de src/components/Filter.js : chip de filtre au-dessus de la carte.
class MapFilterChip extends StatelessWidget {
  final IconData? icon;
  final VoidCallback onPress;
  final VoidCallback? onRemove;
  final String label;

  const MapFilterChip({
    super.key,
    this.icon,
    required this.onPress,
    this.onRemove,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: Material(
        elevation: 3,
        borderRadius: BorderRadius.circular(20),
        color: colors.surface,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onPress,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 18, color: colors.primary),
                  const SizedBox(width: 6),
                ],
                Text(label, style: const TextStyle(fontSize: 14)),
                if (onRemove != null) ...[
                  const SizedBox(width: 4),
                  InkWell(
                    onTap: onRemove,
                    borderRadius: BorderRadius.circular(10),
                    child: const Icon(Icons.close, size: 16),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
