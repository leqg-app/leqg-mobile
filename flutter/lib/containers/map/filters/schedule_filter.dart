import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/action_buttons.dart';
import '../../../components/bar_rheostat.dart';
import '../../../components/filter_chip.dart';
import '../../../constants.dart';
import '../../../models/models.dart';
import '../../../store/atoms.dart';
import '../../../store/filter_atoms.dart';
import '../../../utils/coordinates.dart';
import '../../../utils/schedule_filters.dart';
import '../../../utils/time.dart';

/// Port de src/containers/Map/Filters/ScheduleFilter.js.
/// Curseur (0-48) → minutes : 0 = 7h (420 min), 48 = 7h le lendemain (1860).
int sliderToMinutes(num value) => (420 + value * 30).toInt();

int minutesToSlider(int minutes) => ((minutes - 420) / 30).round();

List<num> _getPricesByTimeSlot(
    List<Store> stores, List<int> selectedDays, MapBounds? bounds) {
  final priceData = List<num>.filled(49, 0);

  for (var slotIndex = 0; slotIndex < 49; slotIndex++) {
    final timeInMinutes = sliderToMinutes(slotIndex);
    double totalPrice = 0;
    int storeCount = 0;

    for (final dayOfWeek in selectedDays) {
      for (final store in stores) {
        if (!isStoreInBounds(store, bounds)) {
          continue;
        }
        if (isStoreOpenAt(store, dayOfWeek, timeInMinutes) &&
            store.price != null &&
            store.price != 0) {
          totalPrice += store.price!;
          storeCount++;
        }
      }
    }

    if (storeCount > 0) {
      priceData[slotIndex] = totalPrice / storeCount;
    }
  }

  return priceData;
}

String _getFilterLabel(ScheduleFilter? scheduleFilter) {
  if (scheduleFilter == null || scheduleFilter.days.isEmpty) {
    return 'Horaires';
  }
  final days = scheduleFilter.days;
  final normalizedStart = scheduleFilter.startTime % 1440;
  final normalizedEnd = scheduleFilter.endTime % 1440;
  final range =
      '${minutesToTime(normalizedStart, short: true)}-${minutesToTime(normalizedEnd, short: true)}';

  if (days.length == 7) {
    return range;
  }
  if (days.length == 1) {
    return '${daysFull[days[0] - 1].substring(0, 3)} $range';
  }
  return '${days.length}j $range';
}

class ScheduleFilterButton extends ConsumerWidget {
  const ScheduleFilterButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scheduleFilter = ref.watch(scheduleFilterProvider);

    void reset() =>
        ref.read(scheduleFilterProvider.notifier).state = null;

    return MapFilterChip(
      icon: Icons.access_time,
      label: _getFilterLabel(scheduleFilter),
      onPress: () {
        ref.read(sheetStoreProvider.notifier).state = null;
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          useSafeArea: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
          ),
          backgroundColor: Theme.of(context).colorScheme.surface,
          builder: (context) => const _ScheduleFilterSheet(),
        );
      },
      onRemove: scheduleFilter != null ? reset : null,
    );
  }
}

class _ScheduleFilterSheet extends ConsumerStatefulWidget {
  const _ScheduleFilterSheet();

  @override
  ConsumerState<_ScheduleFilterSheet> createState() =>
      _ScheduleFilterSheetState();
}

class _ScheduleFilterSheetState extends ConsumerState<_ScheduleFilterSheet> {
  late List<int> selectedDays;
  late List<double> timeValues;

  @override
  void initState() {
    super.initState();
    final scheduleFilter = ref.read(scheduleFilterProvider);

    final currentDate = DateTime.now();
    final currentDay = currentDate.weekday;
    final currentHour = currentDate.hour;
    final currentMinutes = currentHour * 60 + currentDate.minute;

    // Par défaut : 19h-21h avant 19h, sinon heure courante + 1h/3h
    final defaultStartTime = currentHour < 19
        ? 1140
        : (currentMinutes + 60).clamp(0, 1740);
    final defaultEndTime = currentHour < 19
        ? 1260
        : (currentMinutes + 180).clamp(0, 1860);

    if (scheduleFilter != null) {
      selectedDays = [...scheduleFilter.days];
      timeValues = [
        minutesToSlider(scheduleFilter.startTime).toDouble(),
        minutesToSlider(scheduleFilter.endTime).toDouble(),
      ];
    } else {
      selectedDays = [currentDay];
      timeValues = [
        minutesToSlider(defaultStartTime).toDouble(),
        minutesToSlider(defaultEndTime).toDouble(),
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final stores = ref.watch(storesProvider);
    final mapBounds = ref.watch(mapBoundsProvider);

    final startTime = sliderToMinutes(timeValues[0]);
    final endTime = sliderToMinutes(timeValues[1]);

    final priceData = selectedDays.isEmpty || stores.isEmpty
        ? List<num>.filled(49, 0)
        : _getPricesByTimeSlot(stores, selectedDays, mapBounds);

    void toggleDay(int day) {
      setState(() {
        if (selectedDays.contains(day)) {
          selectedDays = selectedDays.where((d) => d != day).toList();
        } else {
          selectedDays = [...selectedDays, day]..sort();
        }
      });
    }

    void reset() {
      ref.read(scheduleFilterProvider.notifier).state = null;
      Navigator.of(context).pop();
    }

    void submit() {
      if (selectedDays.isEmpty) {
        ref.read(scheduleFilterProvider.notifier).state = null;
      } else {
        ref.read(scheduleFilterProvider.notifier).state = ScheduleFilter(
          days: selectedDays,
          startTime: startTime,
          endTime: endTime,
        );
      }
      Navigator.of(context).pop();
    }

    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.only(
                left: 20, right: 20, top: 10, bottom: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Jours', style: Theme.of(context).textTheme.titleMedium),
                Padding(
                  padding: const EdgeInsets.only(top: 10, bottom: 20),
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 5,
                    children: [
                      for (var index = 0; index < daysFull.length; index++)
                        FilterChip(
                          selected: selectedDays.contains(index + 1),
                          onSelected: (_) => toggleDay(index + 1),
                          labelStyle: const TextStyle(fontSize: 12),
                          label: Text(daysFull[index].substring(0, 3)),
                        ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text('Horaires',
                      style: Theme.of(context).textTheme.titleMedium),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(
                    '${minutesToTime(startTime % 1440)} - ${minutesToTime(endTime % 1440)}'
                    '${(startTime >= 1440 || endTime >= 1440) ? ' (lendemain)' : ''}',
                    style: const TextStyle(fontSize: 17),
                  ),
                ),
                Container(
                  height: 250,
                  margin: const EdgeInsets.only(top: 20),
                  child: BarRheostat(
                    values: timeValues,
                    min: 0,
                    max: 48,
                    svgData: priceData,
                    onValuesUpdated: (values) =>
                        setState(() => timeValues = values),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.only(top: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('7h',
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey)),
                      Text('12h',
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey)),
                      Text('17h',
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey)),
                      Text('22h',
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey)),
                      Text('3h',
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey)),
                      Text('7h',
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Colors.grey, width: 0.5)),
            ),
            child: ActionButtons(
              onCancel: reset,
              onSubmit: submit,
              submitLabel: 'OK',
              cancelLabel: 'Réinitialiser',
            ),
          ),
        ],
      ),
    );
  }
}
