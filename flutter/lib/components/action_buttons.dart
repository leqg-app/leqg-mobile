import 'package:flutter/material.dart';

/// Port de src/components/ActionButtons.js : Annuler / valider.
class ActionButtons extends StatelessWidget {
  final VoidCallback onCancel;
  final VoidCallback onSubmit;
  final String submitLabel;
  final String cancelLabel;
  final bool disabled;

  const ActionButtons({
    super.key,
    required this.onCancel,
    required this.onSubmit,
    required this.submitLabel,
    this.cancelLabel = 'Annuler',
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Row(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: OutlinedButton(
                onPressed: onCancel,
                child: Text(cancelLabel),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: FilledButton(
                onPressed: disabled ? null : onSubmit,
                child: Text(submitLabel),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
