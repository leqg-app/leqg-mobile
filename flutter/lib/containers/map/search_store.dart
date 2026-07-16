import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../store/storage.dart';
import '../store/schedules_preview.dart';

/// Port de src/containers/Map/SearchStore.js : recherche plein écran avec
/// historique (5 derniers bars).
class SearchStoreScreen extends ConsumerStatefulWidget {
  const SearchStoreScreen({super.key});

  @override
  ConsumerState<SearchStoreScreen> createState() => _SearchStoreScreenState();
}

class _SearchStoreScreenState extends ConsumerState<SearchStoreScreen> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  String text = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(sheetStoreProvider.notifier).state = null;
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          _focusNode.requestFocus();
        }
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _selectStore(Map<String, dynamic> storeJson) {
    final searchHistory =
        Storage.getObject<List<dynamic>>('searchHistory', [])!;
    // Historique : ne garder que les 5 derniers bars
    final history = searchHistory
        .where((item) => item is Map && item['id'] != storeJson['id'])
        .take(4)
        .toList();
    history.insert(0, {...storeJson, 'history': true});
    Storage.setObject('searchHistory', history);
    ref.read(sheetStoreProvider.notifier).state =
        Store.fromJson(storeJson).copyWith(focus: true);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final stores = ref.watch(storesProvider);

    List<Map<String, dynamic>> filterResult;
    if (text.isEmpty) {
      filterResult = Storage.getObject<List<dynamic>>('searchHistory', [])!
          .whereType<Map>()
          .map((item) => item.cast<String, dynamic>())
          .toList();
    } else {
      filterResult = stores
          .where((store) =>
              store.name.toLowerCase().contains(text.toLowerCase()))
          .take(5)
          .map((store) => store.toJson())
          .toList();
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(
                  top: 10, left: 20, right: 20, bottom: 10),
              height: 50,
              child: Material(
                borderRadius: BorderRadius.circular(30),
                elevation: 1,
                child: TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  onChanged: (value) => setState(() => text = value),
                  decoration: InputDecoration(
                    hintText: 'Rechercher un bar',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    prefixIcon: IconButton(
                      icon: const Icon(Icons.arrow_back),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.manual,
                itemCount: filterResult.length,
                itemBuilder: (context, index) {
                  final store = filterResult[index];
                  final isHistory = store['history'] == true;
                  return InkWell(
                    onTap: () => _selectStore(store),
                    child: Padding(
                      padding: const EdgeInsets.only(left: 10),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(12),
                            child: Icon(
                                isHistory ? Icons.history : Icons.store),
                          ),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  vertical: 10, horizontal: 10),
                              decoration: const BoxDecoration(
                                border: Border(
                                  bottom: BorderSide(
                                      color: Color(0xFFBBBBBB), width: 0.5),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    (store['name'] ?? '') as String,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                  if (store['address'] != null)
                                    Padding(
                                      padding: const EdgeInsets.only(
                                          top: 5, bottom: 2),
                                      child: Text(
                                        store['address'] as String,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                            color: Color(0xFF777777)),
                                      ),
                                    ),
                                  if (store['schedules'] != null)
                                    SchedulesPreview(
                                      schedules:
                                          (store['schedules'] as List)
                                              .map((s) => Schedule.fromJson(
                                                  (s as Map).cast<String,
                                                      dynamic>()))
                                              .toList(),
                                    ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
