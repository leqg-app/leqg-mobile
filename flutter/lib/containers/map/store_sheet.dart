import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/star_rating.dart';
import '../../store/atoms.dart';
import '../store/schedules_preview.dart';
import '../store/store.dart';
import '../store/store_ui_actions.dart';

/// Port de src/containers/Map/StoreSheet.js : bottom sheet du bar à deux
/// crans (aperçu / plein écran) avec top bar animée.
class StoreSheet extends ConsumerStatefulWidget {
  const StoreSheet({super.key});

  @override
  ConsumerState<StoreSheet> createState() => _StoreSheetState();
}

class _StoreSheetState extends ConsumerState<StoreSheet> {
  final DraggableScrollableController _controller =
      DraggableScrollableController();
  double _progress = 0; // 0 = aperçu, 1 = plein écran (≙ animatedIndex)
  bool _show = false;
  double _minSize = 0.25;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onSheetMoved);
  }

  @override
  void dispose() {
    _controller.removeListener(_onSheetMoved);
    _controller.dispose();
    super.dispose();
  }

  void _onSheetMoved() {
    if (!_controller.isAttached) {
      return;
    }
    final size = _controller.size;
    final progress = ((size - _minSize) / (1 - _minSize)).clamp(0.0, 1.0);
    if ((progress - _progress).abs() > 0.001) {
      setState(() => _progress = progress);
    }
    // Fermeture par glissement vers le bas
    if (size < _minSize * 0.5 && ref.read(sheetStoreProvider) != null) {
      ref.read(sheetStoreProvider.notifier).state = null;
    }
  }

  void _collapse() {
    if (_controller.isAttached) {
      _controller.animateTo(_minSize,
          duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    }
  }

  void _expand() {
    if (_controller.isAttached) {
      _controller.animateTo(1,
          duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sheetStore = ref.watch(sheetStoreProvider);
    final colors = Theme.of(context).colorScheme;
    final media = MediaQuery.of(context);
    final topbarHeight = media.padding.top + 50;
    final sheetHeight = media.padding.bottom + 170;
    final screenHeight = media.size.height;
    _minSize = (sheetHeight / screenHeight).clamp(0.05, 0.9);

    ref.listen(sheetStoreProvider, (previous, next) {
      if (next != null && previous == null) {
        setState(() => _progress = 0);
        Future.delayed(
            const Duration(milliseconds: 300),
            () => mounted ? setState(() => _show = true) : null);
      } else if (next == null) {
        setState(() => _show = false);
      }
    });

    if (sheetStore == null) {
      return const SizedBox.shrink();
    }

    final topBarProgress = ((_progress - 0.5) / 0.5).clamp(0.0, 1.0);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          ref.read(sheetStoreProvider.notifier).state = null;
        }
      },
      child: Stack(
        children: [
          DraggableScrollableSheet(
            controller: _controller,
            initialChildSize: _minSize,
            minChildSize: 0,
            maxChildSize: 1,
            snap: true,
            snapSizes: [_minSize, 1],
            builder: (context, scrollController) => Container(
              decoration: BoxDecoration(
                color: colors.surface,
                borderRadius: BorderRadius.vertical(
                    top: Radius.circular(_progress < 0.99 ? 15 : 0)),
              ),
              child: ListView(
                controller: scrollController,
                padding: EdgeInsets.zero,
                children: [
                  Center(
                    child: Container(
                      width: 32,
                      height: 4,
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: colors.onSurfaceVariant,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  // Aperçu (nom, note, horaires, adresse)
                  GestureDetector(
                    onTap: _expand,
                    child: Container(
                      constraints: const BoxConstraints(minHeight: 93),
                      margin: const EdgeInsets.only(bottom: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 15),
                            child: Text(
                              sheetStore.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleLarge
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ),
                          if (sheetStore.rate != null &&
                              sheetStore.rate != 0)
                            Padding(
                              padding: const EdgeInsets.only(
                                  left: 15, right: 15, top: 5),
                              child: Row(
                                children: [
                                  Text(
                                    sheetStore.rate!
                                        .toStringAsFixed(1)
                                        .replaceAll('.', ','),
                                    style: const TextStyle(
                                        color: Colors.grey, fontSize: 14),
                                  ),
                                  const SizedBox(width: 6),
                                  StarRating(
                                    rating: sheetStore.rate!,
                                    starSize: 15,
                                    color: colors.primary,
                                  ),
                                  _StoreRateCount(id: sheetStore.id),
                                ],
                              ),
                            ),
                          Padding(
                            padding: const EdgeInsets.only(
                                left: 16, right: 16, bottom: 15),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.only(
                                      top: 6, bottom: 8),
                                  child: SchedulesPreview(
                                      schedules: sheetStore.schedules),
                                ),
                                Text(sheetStore.address ?? '',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Contenu complet
                  if (_show)
                    Opacity(
                      opacity: _progress,
                      child: StoreContent(sheetStore: sheetStore),
                    ),
                  SizedBox(height: media.padding.bottom + 20),
                ],
              ),
            ),
          ),
          // Top bar (chevron + menu) visible en plein écran
          if (_show)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Transform.translate(
                offset: Offset(0, -topbarHeight * (1 - topBarProgress)),
                child: Opacity(
                  opacity: _progress.clamp(0.0, 1.0),
                  child: Container(
                    height: topbarHeight,
                    padding: EdgeInsets.only(
                        top: media.padding.top, left: 10, right: 10),
                    color: colors.surface,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          iconSize: 30,
                          icon: const Icon(Icons.keyboard_arrow_down),
                          onPressed: _collapse,
                        ),
                        _StoreSheetMenu(id: sheetStore.id),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Port de src/containers/Map/StoreRateCount.js.
class _StoreRateCount extends ConsumerWidget {
  final int id;

  const _StoreRateCount({required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final store = ref.watch(storeDetailProvider(id));
    return store.maybeWhen(
      data: (store) => Padding(
        padding: const EdgeInsets.only(left: 5),
        child: Text('(${store.rateCount})',
            style: const TextStyle(color: Colors.grey, fontSize: 14)),
      ),
      orElse: () => const SizedBox.shrink(),
    );
  }
}

/// Port de src/containers/Map/StoreSheetMenu.js : menu ⋮ de la top bar.
class _StoreSheetMenu extends ConsumerWidget {
  final int id;

  const _StoreSheetMenu({required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storeAsync = ref.watch(storeDetailProvider(id));
    return storeAsync.maybeWhen(
      data: (store) => PopupMenuButton<String>(
        iconSize: 30,
        onSelected: (value) {
          if (value == 'edit') {
            editStoreScreen(context, ref, store);
          } else if (value == 'share') {
            shareStore(store);
          }
        },
        itemBuilder: (context) => const [
          PopupMenuItem(
              value: 'edit', child: Text('Suggérer une modification')),
          PopupMenuItem(value: 'share', child: Text('Partager le lieu')),
        ],
      ),
      orElse: () => const SizedBox.shrink(),
    );
  }
}
