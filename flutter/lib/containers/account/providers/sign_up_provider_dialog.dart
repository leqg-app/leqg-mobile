import 'package:flutter/material.dart';

import '../sign_up_provider.dart';

/// Dialogue « Aucun compte n'existe avec ce service … » et navigation vers
/// l'inscription via provider.
void navigateToSignUpProvider(BuildContext context,
    {required String provider, required String authToken}) {
  Navigator.of(context).push(MaterialPageRoute(
    builder: (context) =>
        SignUpProviderScreen(provider: provider, authToken: authToken),
  ));
}

void askCreateAccount(BuildContext context,
    {required VoidCallback onCancel, required VoidCallback onConfirm}) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      content: const Text(
          "Aucun compte n'existe avec ce service, voulez-vous en créer un nouveau ?"),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            onCancel();
          },
          child: const Text('Annuler'),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            onConfirm();
          },
          child: const Text('OK'),
        ),
      ],
    ),
  );
}
