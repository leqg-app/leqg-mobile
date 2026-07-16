import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/users.dart' as users_api;
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../utils/error_message.dart';
import 'providers/apple_auth.dart';
import 'providers/google_auth.dart';
import 'sign_in.dart';

const _errorMessages = {
  'user.email.taken':
      'Cette adresse email est déjà utilisée, essayez de vous connecter',
  'user.username.taken':
      "Ce nom d'utilisateur est déjà utilisé, choisissez-en un autre",
};

/// Port de src/containers/Account/SignUp.js.
class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key});

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  String? error;
  bool loading = false;
  String username = '';
  String email = '';
  String password = '';
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();

  @override
  void dispose() {
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _signUp() async {
    setState(() {
      error = null;
      loading = true;
    });
    try {
      final user = await users_api.signUp({
        'username': username,
        'email': email,
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
      appBar: AppBar(title: const Text('Inscription')),
      body: SingleChildScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.manual,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Padding(
              padding: EdgeInsets.only(bottom: 20),
              child: Text(
                  'Inscrivez-vous et profitez de tous les avantages des membres'),
            ),
            const GoogleAuth(signUp: true),
            if (Platform.isIOS)
              const Padding(
                padding: EdgeInsets.only(top: 10),
                child: AppleAuth(signUp: true),
              ),
            const Padding(
              padding: EdgeInsets.only(top: 15),
              child: Text('ou', textAlign: TextAlign.center),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 15),
              child: TextField(
                textInputAction: TextInputAction.next,
                onChanged: (value) => setState(() => username = value),
                onSubmitted: (_) => _emailFocus.requestFocus(),
                decoration: const InputDecoration(
                  labelText: 'Pseudo',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 15),
              child: TextField(
                focusNode: _emailFocus,
                textInputAction: TextInputAction.next,
                autocorrect: false,
                keyboardType: TextInputType.emailAddress,
                onChanged: (value) => setState(() => email = value),
                onSubmitted: (_) => _passwordFocus.requestFocus(),
                decoration: const InputDecoration(
                  labelText: 'E-mail',
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
              child: FilledButton(
                onPressed: (username.isEmpty ||
                        email.isEmpty ||
                        password.isEmpty ||
                        loading)
                    ? null
                    : _signUp,
                child: loading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Inscription'),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 30),
              child: Column(
                children: [
                  const Text('Déjà un compte ?', textAlign: TextAlign.center),
                  TextButton(
                    onPressed: () => Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                          builder: (context) => const SignInScreen()),
                    ),
                    child: const Text('Connexion'),
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
