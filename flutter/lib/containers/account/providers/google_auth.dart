import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../api/users.dart' as users_api;
import '../../../components/social_button.dart';
import '../../../models/models.dart';
import '../../../store/atoms.dart';
import '../../../utils/error_message.dart';
import 'sign_up_provider_dialog.dart';

const _errorMessages = {
  'user.blocked':
      "Ce compte a été désactivé, contactez-nous pour plus d'information",
};

GoogleSignIn _googleSignIn() => GoogleSignIn(
      serverClientId: dotenv.env['GOOGLE_WEB_CLIENT_ID'],
    );

Future<void> googleSignOut() async {
  try {
    await _googleSignIn().disconnect();
  } catch (_) {}
}

/// Port de src/containers/Account/Providers/GoogleAuth.js.
class GoogleAuth extends ConsumerStatefulWidget {
  final bool signUp;

  const GoogleAuth({super.key, this.signUp = false});

  @override
  ConsumerState<GoogleAuth> createState() => _GoogleAuthState();
}

class _GoogleAuthState extends ConsumerState<GoogleAuth> {
  bool loading = false;

  Future<void> _connect() async {
    setState(() => loading = true);
    try {
      final account = await _googleSignIn().signIn();
      if (account == null) {
        // Connexion annulée
        setState(() => loading = false);
        return;
      }
      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) {
        throw 'Une erreur est survenue';
      }

      Map<String, dynamic> user;
      try {
        user = await users_api.signInProvider('google', idToken);
        ref.read(userProvider.notifier).set(User(user));
        setState(() => loading = false);
        return;
      } catch (error) {
        if (error.toString() != 'user.notfound') {
          rethrow;
        }
      }

      setState(() => loading = false);
      if (!mounted) {
        return;
      }

      if (widget.signUp) {
        navigateToSignUpProvider(context, provider: 'google', authToken: idToken);
        return;
      }

      askCreateAccount(
        context,
        onCancel: googleSignOut,
        onConfirm: () => navigateToSignUpProvider(context,
            provider: 'google', authToken: idToken),
      );
    } catch (err) {
      setState(() => loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(getErrorMessage(err, _errorMessages)),
          duration: const Duration(seconds: 3),
          action: SnackBarAction(label: 'OK', onPressed: () {}),
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SocialButton(
        provider: 'Google', onPress: _connect, loading: loading);
  }
}
