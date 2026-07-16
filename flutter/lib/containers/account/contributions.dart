import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/users.dart' as users_api;
import '../../store/atoms.dart';
import '../../utils/time_ago.dart';

/// Port de src/containers/Account/Contributions.js : liste paginée.
const _reasons = {
  'store.creation': "Création d'un bar",
  'store.edition': "Modification d'un bar",
  'store.validation.creation': "Validation d'un bar",
  'store.validation.reward': 'Remerciement pour votre contribution',
  'store.rate.creation': "Ajout d'une note à un bar",
  'unknown': 'Autre',
};

class ContributionsScreen extends ConsumerStatefulWidget {
  const ContributionsScreen({super.key});

  @override
  ConsumerState<ContributionsScreen> createState() =>
      _ContributionsScreenState();
}

class _ContributionsScreenState extends ConsumerState<ContributionsScreen> {
  final List<Map<String, dynamic>> data = [];
  bool loading = false;
  String? error;
  int page = 1;
  bool hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadContributions(1);
  }

  Future<void> _loadContributions(int newPage) async {
    final user = ref.read(userProvider);
    setState(() {
      page = newPage;
      loading = true;
    });
    try {
      final newItems =
          await users_api.getContributions(user?.jwt ?? '', newPage);
      if (newItems.length < 50) {
        hasMore = false;
      }
      setState(() {
        data.addAll(
            newItems.map((c) => (c as Map).cast<String, dynamic>()));
        loading = false;
      });
    } catch (err) {
      setState(() {
        error = 'Error: $err';
        loading = false;
      });
    }
  }

  void _loadMore() {
    if (!hasMore || loading) {
      return;
    }
    _loadContributions(page + 1);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contributions')),
      body: NotificationListener<ScrollNotification>(
        onNotification: (notification) {
          if (notification.metrics.pixels >
              notification.metrics.maxScrollExtent - 200) {
            _loadMore();
          }
          return false;
        },
        child: ListView.builder(
          itemCount: data.length + 1,
          itemBuilder: (context, index) {
            if (index == data.length) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: loading
                      ? const CircularProgressIndicator()
                      : Text(
                          error ?? '${data.length} contributions',
                          style: const TextStyle(color: Color(0xFF777777)),
                        ),
                ),
              );
            }
            final contribution = data[index];
            final date = formatDistanceToNow(DateTime.parse(
                (contribution['createdAt'] ?? '') as String));
            final store = (contribution['revision'] ??
                contribution['validation'])?['store'] as Map?;
            return Container(
              height: 65,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0x1F000000), width: 0.5),
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _reasons[contribution['reason']] ??
                            _reasons['unknown']!,
                        style: const TextStyle(color: Color(0xFF777777)),
                      ),
                      Text(date,
                          style:
                              const TextStyle(color: Color(0xFF777777))),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 5),
                    child: Text(
                      (store?['name'] ?? 'Lieu supprimé') as String,
                      style: const TextStyle(fontSize: 17),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
