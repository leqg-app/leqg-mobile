import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/users.dart' as users_api;
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../utils/error_message.dart';

const _errorMessages = {
  'user.username.taken':
      "Ce nom d'utilisateur est déjà utilisé, choisissez-en un autre",
  'user.email.taken':
      "Ce nom d'utilisateur est déjà utilisé, choisissez-en un autre",
};

/// Port de src/containers/Account/SignUpProvider.js : choix du pseudo pour
/// finaliser une inscription Google/Apple.
class SignUpProviderScreen extends ConsumerStatefulWidget {
  final String provider;
  final String authToken;

  const SignUpProviderScreen(
      {super.key, required this.provider, required this.authToken});

  @override
  ConsumerState<SignUpProviderScreen> createState() =>
      _SignUpProviderScreenState();
}

class _SignUpProviderScreenState extends ConsumerState<SignUpProviderScreen> {
  String? error;
  bool loading = false;
  String username = '';

  Future<void> _signUp() async {
    setState(() {
      error = null;
      loading = true;
    });
    try {
      final user = await users_api.signUpProvider(widget.provider, {
        'username': username,
        'auth_token': widget.authToken,
      });
      ref.read(userProvider.notifier).set(User(user));
    } catch (err) {
      setState(() {
        error = getErrorMessage(err, _errorMessages);
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Inscription')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Choisissez un pseudo pour finaliser votre inscription'),
            Padding(
              padding: const EdgeInsets.only(top: 15),
              child: TextField(
                autofocus: true,
                textInputAction: TextInputAction.next,
                onChanged: (value) => setState(() => username = value),
                decoration: const InputDecoration(
                  labelText: 'Pseudo',
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
                onPressed: (username.isEmpty || loading) ? null : _signUp,
                child: loading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Inscription'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
