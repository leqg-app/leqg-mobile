import 'package:flutter/material.dart';

/// Dialogue « Connexion requise » récurrent dans l'app RN
/// (Alert.alert avec boutons Annuler / Connexion).
Future<void> showLoginRequiredDialog(
  BuildContext context, {
  required String message,
  required VoidCallback onLogin,
}) {
  return showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Connexion requise'),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Annuler'),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            onLogin();
          },
          child: const Text('Connexion'),
        ),
      ],
    ),
  );
}

/// Alert.alert générique à deux boutons (confirmations).
Future<void> showConfirmDialog(
  BuildContext context, {
  String title = 'Confirmation',
  required String message,
  String okLabel = 'OK',
  required VoidCallback onConfirm,
}) {
  return showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Annuler'),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            onConfirm();
          },
          child: Text(okLabel),
        ),
      ],
    ),
  );
}
