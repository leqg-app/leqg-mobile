import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants.dart';
import '../../models/models.dart';
import '../../store/atoms.dart';
import '../../utils/time.dart';

/// Port de src/containers/EditStore/EditSchedules.js.
Schedule newSchedule(int i) => Schedule(dayOfWeek: i + 1, closed: false);

const _defaultsHour = {
  'opening': 17,
  'closing': 2,
  'openingSpecial': 18,
  'closingSpecial': 20,
};

const _scheduleTypes = [
  (name: 'Ouverture', type: 'opening'),
  (name: 'Fermeture', type: 'closing'),
  (name: 'Début Happy hour', type: 'openingSpecial'),
  (name: 'Fin Happy hour', type: 'closingSpecial'),
];

String _time(int? open, int? close) =>
    open == null ? '-' : '${minutesToTime(open)}-${minutesToTime(close)}';

class EditSchedulesScreen extends ConsumerStatefulWidget {
  const EditSchedulesScreen({super.key});

  @override
  ConsumerState<EditSchedulesScreen> createState() =>
      _EditSchedulesScreenState();
}

class _EditSchedulesScreenState extends ConsumerState<EditSchedulesScreen> {
  late List<Schedule> schedules;

  @override
  void initState() {
    super.initState();
    final storeEdition = ref.read(storeEditionProvider);
    final existing = storeEdition.schedules;
    if (existing == null || existing.length < 7) {
      schedules = List.generate(7, newSchedule);
    } else {
      schedules = [...existing]
        ..sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    }
  }

  void _save() {
    final storeEdition = ref.read(storeEditionProvider);
    ref.read(storeEditionProvider.notifier).state =
        storeEdition.copyWith(schedules: schedules);
    Navigator.of(context).pop();
  }

  Future<void> _editDays(List<int> editingDays) async {
    final edited = await showDialog<(List<int>, Schedule)>(
      context: context,
      builder: (context) => _EditSchedulesDialog(
        schedule: schedules[editingDays[0]],
        editingDays: editingDays,
      ),
    );
    if (edited == null) {
      return;
    }
    final (editedDays, schedule) = edited;
    setState(() {
      for (final editedDay in editedDays) {
        schedules[editedDay] = Schedule(
          dayOfWeek: editedDay + 1,
          closed: schedule.closed,
          opening: schedule.closed ? null : schedule.opening,
          closing: schedule.closed ? null : schedule.closing,
          openingSpecial: schedule.closed ? null : schedule.openingSpecial,
          closingSpecial: schedule.closed ? null : schedule.closingSpecial,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Modifier les horaires'),
        actions: [
          IconButton(icon: const Icon(Icons.check), onPressed: _save),
        ],
      ),
      body: ListView(
        children: [
          for (var i = 0; i < daysFull.length; i++)
            InkWell(
              onTap: () => _editDays([i]),
              child: Container(
                height: 55,
                padding: const EdgeInsets.symmetric(horizontal: 25),
                decoration: const BoxDecoration(
                  border: Border(
                    bottom:
                        BorderSide(color: Color(0xFFDDDDDD), width: 0.5),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(child: Text(daysFull[i])),
                    if (schedules[i].closed) ...[
                      const SizedBox(
                          width: 90,
                          child:
                              Text('Fermé', textAlign: TextAlign.center)),
                      const SizedBox(width: 90),
                    ] else ...[
                      SizedBox(
                        width: 90,
                        child: Text(
                          _time(schedules[i].opening, schedules[i].closing),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      SizedBox(
                        width: 90,
                        child: Text(
                          _time(schedules[i].openingSpecial,
                              schedules[i].closingSpecial),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                    const Icon(Icons.edit, size: 20),
                  ],
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(30),
            child: FilledButton.icon(
              onPressed: () =>
                  _editDays(List.generate(7, (index) => index)),
              icon: const Icon(Icons.edit, size: 18),
              label: const Text('Tout modifier'),
            ),
          ),
        ],
      ),
    );
  }
}

class _EditSchedulesDialog extends StatefulWidget {
  final Schedule schedule;
  final List<int> editingDays;

  const _EditSchedulesDialog(
      {required this.schedule, required this.editingDays});

  @override
  State<_EditSchedulesDialog> createState() => _EditSchedulesDialogState();
}

class _EditSchedulesDialogState extends State<_EditSchedulesDialog> {
  late List<int> daysSelected = [...widget.editingDays];
  late bool closed = widget.schedule.closed;
  late int? opening = widget.schedule.opening;
  late int? closing = widget.schedule.closing;
  late int? openingSpecial = widget.schedule.openingSpecial;
  late int? closingSpecial = widget.schedule.closingSpecial;

  int? _get(String type) => switch (type) {
        'opening' => opening,
        'closing' => closing,
        'openingSpecial' => openingSpecial,
        _ => closingSpecial,
      };

  void _set(String type, int? value) {
    setState(() {
      switch (type) {
        case 'opening':
          opening = value;
        case 'closing':
          closing = value;
        case 'openingSpecial':
          openingSpecial = value;
        default:
          closingSpecial = value;
      }
    });
  }

  void _onPressDay(int day) {
    setState(() {
      if (daysSelected.contains(day)) {
        daysSelected = daysSelected.where((d) => d != day).toList();
      } else {
        daysSelected = [...daysSelected, day];
      }
    });
  }

  Future<void> _pickTime(String type) async {
    final current = _get(type);
    final initial = current ?? _defaultsHour[type]! * 60;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: initial ~/ 60, minute: initial % 60),
      confirmText: 'Valider',
      cancelText: 'Annuler',
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
        child: child!,
      ),
    );
    if (time != null) {
      _set(type, time.hour * 60 + time.minute);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    final disabled = !closed &&
        (opening == null ||
            closing == null ||
            (openingSpecial != null && closingSpecial == null) ||
            (openingSpecial == null && closingSpecial != null));

    return AlertDialog(
      title: const Text('Sélectionner des jours et des horaires'),
      content: SizedBox(
        width: double.maxFinite,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  for (var i = 0; i < daysShort.length; i++)
                    Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: colors.primary, width: 2),
                        color: daysSelected.contains(i)
                            ? colors.primary
                            : Colors.transparent,
                      ),
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: () => _onPressDay(i),
                        child: SizedBox(
                          width: 30,
                          height: 30,
                          child: Center(
                            child: Text(
                              daysShort[i],
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: daysSelected.contains(i)
                                    ? colors.onPrimary
                                    : colors.primary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(top: 20, bottom: 10),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () => setState(() => closed = !closed),
                      child: const Text('Fermé'),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 15),
                      child: Switch(
                        value: closed,
                        activeThumbColor: colors.primary,
                        onChanged: (_) => setState(() => closed = !closed),
                      ),
                    ),
                  ],
                ),
              ),
              if (!closed) ...[
                for (final scheduleType in _scheduleTypes)
                  InkWell(
                    onTap: () => _pickTime(scheduleType.type),
                    child: Container(
                      height: 50,
                      decoration: const BoxDecoration(
                        border: Border(
                          bottom:
                              BorderSide(color: Colors.grey, width: 0.5),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(scheduleType.name),
                          Text(_get(scheduleType.type) != null
                              ? minutesToTime(_get(scheduleType.type))
                              : '-'),
                        ],
                      ),
                    ),
                  ),
                if (openingSpecial != null || closingSpecial != null)
                  TextButton(
                    onPressed: () {
                      setState(() {
                        openingSpecial = null;
                        closingSpecial = null;
                      });
                    },
                    child: const Text("Effacer l'happy hour"),
                  ),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Annuler'),
        ),
        TextButton(
          onPressed: disabled
              ? null
              : () => Navigator.of(context).pop((
                    daysSelected,
                    Schedule(
                      dayOfWeek: 1,
                      closed: closed,
                      opening: opening,
                      closing: closing,
                      openingSpecial: openingSpecial,
                      closingSpecial: closingSpecial,
                    )
                  )),
          child: const Text('OK'),
        ),
      ],
    );
  }
}
