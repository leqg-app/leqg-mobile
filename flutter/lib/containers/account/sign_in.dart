import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/users.dart' as users_api;
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../utils/error_message.dart';
import 'providers/apple_auth.dart';
import 'providers/google_auth.dart';
import 'reset_password.dart';
import 'sign_up.dart';

const _errorMessages = {
  'user.credentials': 'Identifiant ou mot de passe incorrect',
  'user.confirmed': 'Confirmez votre email afin de vous connecter',
  'user.blocked':
      "Ce compte a été désactivé, contactez-nous pour plus d'information",
  'user.provider':
      "Ce compte n'a pas de mot de passe, utilisez le moyen de connexion que vous avez choisi lors de l'inscription",
  'user.email.provide': 'Email invalide',
  'user.email.format': 'Email invalide',
  'user.password.provide': 'Mot de passe invalide',
};

/// Port de src/containers/Account/SignIn.js.
class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  String? error;
  bool loading = false;
  String username = '';
  String password = '';
  final FocusNode _passwordFocus = FocusNode();

  @override
  void dispose() {
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    setState(() {
      error = null;
      loading = true;
    });
    try {
      final user = await users_api.signIn({
        'identifier': username.trim(),
        'password': password,
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
      appBar: AppBar(title: const Text('Connexion')),
      body: SingleChildScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.manual,
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const GoogleAuth(),
            if (Platform.isIOS)
              const Padding(
                padding: EdgeInsets.only(top: 10),
                child: AppleAuth(),
              ),
            const Padding(
              padding: EdgeInsets.only(top: 15),
              child: Text('ou', textAlign: TextAlign.center),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 15),
              child: TextField(
                maxLength: 20,
                textInputAction: TextInputAction.next,
                onChanged: (value) => setState(() => username = value),
                onSubmitted: (_) => _passwordFocus.requestFocus(),
                decoration: const InputDecoration(
                  labelText: 'Pseudo',
                  counterText: '',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 15),
              child: TextField(
                focusNode: _passwordFocus,
                obscureText: true,
                textInputAction: TextInputAction.done,
                onChanged: (value) => setState(() => password = value),
                decoration: const InputDecoration(
                  labelText: 'Mot de passe',
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
              child: TextButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(
                      builder: (context) => const ResetPasswordScreen()),
                ),
                child: const Text('Mot de passe oublié'),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 15),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: (username.isEmpty || password.isEmpty || loading)
                      ? null
                      : _signIn,
                  child: loading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Connexion'),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 30),
              child: Column(
                children: [
                  const Text('Pas encore de compte ?',
                      textAlign: TextAlign.center),
                  TextButton(
                    onPressed: () => Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                          builder: (context) => const SignUpScreen()),
                    ),
                    child: const Text('Inscription'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
