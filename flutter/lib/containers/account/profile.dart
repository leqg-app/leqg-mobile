import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/users.dart' as users_api;
import '../../components/dialogs.dart';
import '../../store/atoms.dart';
import '../../utils/error_message.dart';
import 'providers/apple_auth.dart';
import 'providers/google_auth.dart';

/// Port de src/containers/Account/Profile.js : pseudo + suppression de compte.
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  String? error;
  bool loading = false;

  Future<void> _deleteAccount() async {
    final user = ref.read(userProvider);
    setState(() {
      error = null;
      loading = true;
    });
    try {
      await users_api.deleteProfile(user!.jwt);
      if (user.provider == 'google') {
        googleSignOut();
      } else if (user.provider == 'apple') {
        appleSignOut();
      }
      ref.read(userProvider.notifier).set(null);
      setState(() => loading = false);
      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (err) {
      setState(() {
        error = getErrorMessage(err);
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProvider);
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Mon profil')),
      body: SingleChildScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.manual,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              enabled: false,
              controller: TextEditingController(text: user?.username),
              decoration: const InputDecoration(
                labelText: 'Pseudo',
                border: OutlineInputBorder(),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(top: 4),
              child: Text(
                "Il n'est pas possible pour le moment de modifier son pseudo.",
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ),
            const Divider(height: 30),
            const Text(
              'Supprimer votre compte effacera vos informations personnelles de notre base de données.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 5),
              child: FilledButton(
                onPressed: loading
                    ? null
                    : () => showConfirmDialog(
                          context,
                          message:
                              'Êtes-vous sûr de vouloir supprimer votre compte ?',
                          onConfirm: _deleteAccount,
                        ),
                child: loading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Supprimer mon compte'),
              ),
            ),
            if (error != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(error!, style: TextStyle(color: colors.error)),
              ),
          ],
        ),
      ),
    );
  }
}
