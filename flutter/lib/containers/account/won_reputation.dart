import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/users.dart' as users_api;
import '../../components/animated_circle.dart';
import '../../components/animated_text.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';

/// Port de src/containers/Account/WonReputation.js : points gagnés.
const _displayFields = {
  'name': 'Nom',
  'address': 'Adresse',
  'website': 'Site internet',
  'phone': 'Téléphone',
  'products': 'Produit(s)',
  'schedules': 'Horaire(s)',
  'features': 'Caractéristique(s)',
  'rate': 'Note',
  'comment': 'Commentaire',
  'longComment': 'Bonus commentaire long',
  'recommendedProduct': 'Produit(s) recommandé(s)',
};

const _reasons = {
  'store.creation': "Ajout d'un lieu",
  'store.edition': "Modification d'un lieu",
  'store.validation.creation': "Validation d'un lieu",
  'store.rate.creation': 'Note',
};

class WonReputationScreen extends ConsumerWidget {
  final Map<String, dynamic> reputation;

  const WonReputationScreen({super.key, required this.reputation});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    final userReputation = user?.reputation ?? 0;
    final won = ((reputation['total'] ?? 0) as num).toDouble();

    // Regrouper les champs par nom (≙ groupFields)
    final fields = <String, ({String fieldName, num reputation, int count})>{};
    for (final field in (reputation['fields'] as List?) ?? const []) {
      final fieldName = (field['fieldName'] ?? '') as String;
      final current = fields[fieldName];
      fields[fieldName] = (
        fieldName: _displayFields[fieldName] ?? 'autre',
        reputation:
            (current?.reputation ?? 0) + ((field['reputation'] ?? 0) as num),
        count: (current?.count ?? 0) + 1,
      );
    }

    Future<void> close() async {
      final navigator = Navigator.of(context);
      users_api
          .getProfile(user?.jwt ?? '')
          .then((profile) => ref.read(userProvider.notifier).set(User(profile)))
          .catchError((_) {});
      navigator.pop();
    }

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IconButton(icon: const Icon(Icons.close), onPressed: close),
              const Spacer(),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(bottom: 20),
                        child: Text(
                          'Bravo ! Vous gagnez des points en aidant la communauté',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.w500),
                        ),
                      ),
                      const Divider(),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        child: Row(
                          children: [
                            Expanded(
                              child: Center(
                                child: AnimatedCircle(
                                    initial: userReputation, won: won),
                              ),
                            ),
                            Expanded(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Text('+ '),
                                  AnimatedCountText(initial: 0, won: won),
                                  Text(' point${won > 1 ? 's' : ''}'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(
                            left: 20, right: 20, bottom: 20),
                        child: Column(
                          children: [
                            if (fields.isNotEmpty)
                              for (final field in fields.values)
                                Padding(
                                  padding:
                                      const EdgeInsets.only(bottom: 10),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${field.count > 1 ? ' ${field.count}' : ''}'
                                        '${field.fieldName.replaceAll('(s)', field.count > 1 ? 's' : '')}',
                                      ),
                                      Text('+${field.reputation}'),
                                    ],
                                  ),
                                )
                            else
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(_reasons[reputation['reason']] ?? ''),
                                  Text('+${reputation['total'] ?? 0}'),
                                ],
                              ),
                          ],
                        ),
                      ),
                      const Divider(),
                      const Padding(
                        padding: EdgeInsets.only(top: 20),
                        child: Text(
                          "Gagner des points vous permet d'accéder à de nouvelles fonctionnalités de l'application",
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 20),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: close,
                    child: const Text('Fermer'),
                  ),
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
