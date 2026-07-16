import 'package:flutter/material.dart';

import '../../api/users.dart' as users_api;
import '../../utils/error_message.dart';

const _errorMessages = {
  'email.format': 'Adresse email invalide',
  'user.not-exist': "Cet email n'a pas de compte",
  'user.blocked':
      "Ce compte a été désactivé, contactez-nous pour plus d'information",
};

/// Port de src/containers/Account/ResetPassword.js.
class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  String? error;
  bool loading = false;
  String email = '';

  Future<void> _submit() async {
    if (email.isEmpty) {
      setState(() {
        error = "L'email est obligatoire";
        loading = false;
      });
      return;
    }
    setState(() {
      error = null;
      loading = true;
    });
    try {
      await users_api.resetPassword({'email': email});
    } catch (err) {
      setState(() {
        error = getErrorMessage(err, _errorMessages);
        loading = false;
      });
      return;
    }
    setState(() => loading = false);
    if (!mounted) {
      return;
    }
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Envoyé !'),
        content: const Text(
            'Vérifiez vos emails, vous trouverez un lien pour changer de mot de passe.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
    if (mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Mot de passe oublié')),
      body: SingleChildScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.manual,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Mot de passe oublié',
                style: Theme.of(context).textTheme.headlineSmall),
            Padding(
              padding: const EdgeInsets.only(top: 15),
              child: TextField(
                autocorrect: false,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.done,
                onChanged: (value) => setState(() => email = value),
                decoration: const InputDecoration(
                  labelText: 'E-mail',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            if (error != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(error!, style: TextStyle(color: colors.error)),
              ),
            Padding(
              padding: const EdgeInsets.only(top: 15),
              child: FilledButton(
                onPressed: (email.isEmpty || loading) ? null : _submit,
                child: loading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Réinitialiser'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
