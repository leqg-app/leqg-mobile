import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/animated_circle.dart';
import '../../components/dialogs.dart';
import '../../components/menu.dart';
import '../../components/title.dart';
import '../../components/version_name.dart';
import '../../constants.dart';
import '../../store/atoms.dart';
import '../../tabs.dart';
import '../../utils/reputation.dart';
import 'contributions.dart';
import 'profile.dart';
import 'providers/apple_auth.dart';
import 'providers/google_auth.dart';
import 'settings.dart';
import 'sign_in.dart';
import 'sign_up.dart';

/// Port de src/containers/Account/Account.js + Anonym.js : onglet Compte avec
/// navigateur imbriqué (la barre d'onglets reste visible).
class AccountTab extends ConsumerWidget {
  const AccountTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // À la connexion/déconnexion, revenir à la racine de l'onglet
    // (≙ rendu conditionnel du stack RN)
    ref.listen(userProvider, (previous, next) {
      if ((previous == null) != (next == null)) {
        accountNavigatorKey.currentState
            ?.popUntil((route) => route.isFirst);
      }
    });

    return Navigator(
      key: accountNavigatorKey,
      onGenerateRoute: (settings) => MaterialPageRoute(
        settings: settings,
        builder: (context) => const _AccountRoot(),
      ),
    );
  }
}

class _AccountRoot extends ConsumerWidget {
  const _AccountRoot();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    if (user != null && user.jwt.isNotEmpty) {
      return const _AccountScreen();
    }
    return const _AnonymScreen();
  }
}

/// Écran connecté (≙ Account.js).
class _AccountScreen extends ConsumerWidget {
  const _AccountScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    if (user == null) {
      return const SizedBox.shrink();
    }

    void signOut() {
      if (user.provider == 'google') {
        googleSignOut();
      } else if (user.provider == 'apple') {
        appleSignOut();
      }
      ref.read(userProvider.notifier).set(null);
    }

    final reputation = user.reputation;
    final currentLevel = getLevel(reputation);
    final nextLevel = levels[currentLevel];

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ListView(
          children: [
            const ScreenTitle('Mon Compte'),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  AnimatedCircle(initial: reputation, won: 0),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user.username,
                              style:
                                  Theme.of(context).textTheme.titleMedium),
                          Text(
                              'Prochain niveau: ${reputation.truncate()}/${nextLevel.truncate()}'),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            MenuList(children: [
              MenuListItem(
                name: 'Mon profil',
                iconData: Icons.person,
                onPress: () =>
                    Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => const ProfileScreen(),
                )),
              ),
              MenuListItem(
                name: 'Mes contributions',
                iconData: Icons.thumb_up,
                value: '${user.contributions.length}',
                onPress: () =>
                    Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => const ContributionsScreen(),
                )),
              ),
              MenuListItem(
                name: 'Préférences',
                iconData: Icons.settings_outlined,
                last: true,
                onPress: () =>
                    Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => const SettingsScreen(),
                )),
              ),
              MenuListItem(
                name: 'Se déconnecter',
                iconData: Icons.logout,
                onPress: () => showConfirmDialog(
                  context,
                  message: 'Voulez-vous vraiment vous déconnecter ?',
                  onConfirm: signOut,
                ),
              ),
            ]),
            const VersionName(),
          ],
        ),
      ),
    );
  }
}

/// Écran anonyme (≙ Anonym.js).
class _AnonymScreen extends StatelessWidget {
  const _AnonymScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ListView(
          children: [
            const Padding(
              padding: EdgeInsets.only(bottom: 20),
              child: ScreenTitle('Mon Compte'),
            ),
            MenuList(children: [
              MenuListItem(
                name: 'Connexion',
                iconData: Icons.how_to_reg,
                onPress: () =>
                    Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => const SignInScreen(),
                )),
              ),
              MenuListItem(
                name: 'Inscription',
                iconData: Icons.person_add,
                last: true,
                onPress: () =>
                    Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => const SignUpScreen(),
                )),
              ),
            ]),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Inscrivez-vous gratuitement',
                      style: Theme.of(context).textTheme.titleMedium),
                  const Text(
                    '- Remerciez les contributeurs pour leur travail\n'
                    '- Enregistrez vos bars favoris\n'
                    '- Contribuez pour aider les autres utilisateurs\n'
                    '- Gagnez en réputation et accédez à de nouvelles fonctionnalités',
                  ),
                ],
              ),
            ),
            MenuList(children: [
              MenuListItem(
                name: 'Préférences',
                iconData: Icons.settings_outlined,
                last: true,
                onPress: () =>
                    Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => const SettingsScreen(),
                )),
              ),
            ]),
            const VersionName(),
          ],
        ),
      ),
    );
  }
}
