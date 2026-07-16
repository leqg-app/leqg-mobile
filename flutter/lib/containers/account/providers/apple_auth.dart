import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

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

void appleSignOut() {
  // TODO (comme l'app RN)
}

/// Port de src/containers/Account/Providers/AppleAuth.js.
class AppleAuth extends ConsumerStatefulWidget {
  final bool signUp;

  const AppleAuth({super.key, this.signUp = false});

  @override
  ConsumerState<AppleAuth> createState() => _AppleAuthState();
}

class _AppleAuthState extends ConsumerState<AppleAuth> {
  bool loading = false;

  Future<void> _connect() async {
    setState(() => loading = true);
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [AppleIDAuthorizationScopes.email],
      );
      final identityToken = credential.identityToken;
      if (identityToken == null) {
        throw 'Une erreur est survenue';
      }

      Map<String, dynamic> user;
      try {
        user = await users_api.signInProvider('apple', identityToken);
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
        navigateToSignUpProvider(context,
            provider: 'apple', authToken: identityToken);
        return;
      }

      askCreateAccount(
        context,
        onCancel: appleSignOut,
        onConfirm: () => navigateToSignUpProvider(context,
            provider: 'apple', authToken: identityToken),
      );
    } on SignInWithAppleAuthorizationException catch (err) {
      setState(() => loading = false);
      if (err.code == AuthorizationErrorCode.canceled ||
          err.code == AuthorizationErrorCode.unknown) {
        return;
      }
      _showError(err);
    } catch (err) {
      setState(() => loading = false);
      _showError(err);
    }
  }

  void _showError(Object err) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(getErrorMessage(err, _errorMessages)),
        duration: const Duration(seconds: 3),
        action: SnackBarAction(label: 'OK', onPressed: () {}),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return SocialButton(provider: 'Apple', onPress: _connect, loading: loading);
  }
}
