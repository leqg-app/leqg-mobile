import 'package:flutter/material.dart';

/// Équivalent de src/components/ActionSheet.js : bottom sheet modale avec
/// poignée, contenu et footer optionnel.
Future<T?> showActionSheet<T>(
  BuildContext context, {
  required Widget Function(BuildContext context, ScrollController controller)
      builder,
  Widget? footer,
  double? heightFactor,
  bool backdrop = false,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Theme.of(context).colorScheme.surface,
    barrierColor: backdrop ? Colors.black54 : Colors.transparent,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
    ),
    builder: (context) {
      final content = Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 32,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          if (heightFactor != null)
            Expanded(child: builder(context, ScrollController()))
          else
            Flexible(child: builder(context, ScrollController())),
          if (footer != null)
            Container(
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: Colors.grey, width: 0.5),
                ),
              ),
              child: SafeArea(top: false, child: footer),
            ),
        ],
      );
      if (heightFactor != null) {
        return FractionallySizedBox(heightFactor: heightFactor, child: content);
      }
      return Padding(
        padding:
            EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: content,
      );
    },
  );
}
