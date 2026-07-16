import 'package:flutter/material.dart';

import '../../utils/time_ago.dart';

/// Port de src/containers/EditStore/History.js : historique des révisions.
const _actions = {
  'created': 'ajout',
  'updated': 'modification',
  'deleted': 'suppression',
};

const _targets = {
  'name': 'du nom',
  'phone': 'du téléphone',
  'website': 'du site internet',
  'address': "de l'adresse",
  'products': "d'une bière",
  'schedules': 'des horaires',
  'features': "d'une caractéristique",
};

class HistoryScreen extends StatelessWidget {
  final List<dynamic> revisions;

  const HistoryScreen({super.key, required this.revisions});

  @override
  Widget build(BuildContext context) {
    final sorted = [...revisions]..sort((a, b) =>
        ((a['createdAt'] ?? '') as String)
            .compareTo((b['createdAt'] ?? '') as String));

    return Scaffold(
      appBar: AppBar(title: const Text('Historique')),
      body: ListView.builder(
        itemCount: sorted.length,
        itemBuilder: (context, index) {
          final revision = (sorted[index] as Map).cast<String, dynamic>();
          final author =
              (revision['user']?['username'] ?? 'anonyme') as String;
          final date = formatDistanceToNow(
              DateTime.parse((revision['createdAt'] ?? '') as String));
          final changes = (revision['changes'] as List?) ?? const [];

          return Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0x1F000000), width: 0.5),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: Text(author)),
                    Expanded(
                      child: Text(
                        date,
                        textAlign: TextAlign.right,
                        style: const TextStyle(color: Color(0xFF555555)),
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (final change in changes)
                        Text(change['type'] == 'initial'
                            ? '- création du bar'
                            : '- ${_actions[change['type']] ?? 'modification'} ${_targets[change['field']] ?? "d'un champ"}'),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
