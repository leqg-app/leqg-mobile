import 'package:flutter/material.dart';

import '../../constants.dart';
import '../../models/models.dart';
import '../../utils/time.dart';

/// Port de src/containers/Store/SchedulesPreview.js : « Ouvert jusqu'à … » /
/// « Fermé – Ouvre … » + happy hour.
Schedule? _findNextOpenDay(List<Schedule> schedules, int currentDay) {
  final days = [...schedules]..sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  final nextDays = [...days.skip(currentDay), ...days.take(currentDay)];
  for (final schedule in nextDays) {
    if (!schedule.closed) {
      return schedule;
    }
  }
  return null;
}

class _Open extends StatelessWidget {
  final Schedule? today;

  const _Open({this.today});

  @override
  Widget build(BuildContext context) {
    final closing = today?.closing;
    final openingSpecial = today?.openingSpecial;
    final closingSpecial = today?.closingSpecial;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text.rich(TextSpan(children: [
          const TextSpan(
              text: 'Ouvert', style: TextStyle(color: Colors.green)),
          if (closing != null)
            TextSpan(
                text: " jusqu'à ${minutesToTime(closing, short: true)}"),
        ])),
        if (openingSpecial != null)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text.rich(TextSpan(children: [
              const TextSpan(text: 'Happy hour de '),
              TextSpan(
                text:
                    '${minutesToTime(openingSpecial)} à ${minutesToTime(closingSpecial)}',
                style: inHours(openingSpecial, closingSpecial)
                    ? const TextStyle(fontWeight: FontWeight.bold)
                    : null,
              ),
            ])),
          ),
      ],
    );
  }
}

class _Closed extends StatelessWidget {
  final Schedule today;
  final Schedule? nextOpenDay;

  const _Closed({required this.today, this.nextOpenDay});

  @override
  Widget build(BuildContext context) {
    final opening = today.opening;
    final date = DateTime.now();
    final now = date.hour * 60 + date.minute;

    return Text.rich(TextSpan(children: [
      const TextSpan(
          text: 'Fermé', style: TextStyle(color: Color(0xFFFF586B))),
      if (opening != null && now < opening)
        TextSpan(text: ' – Ouvre à ${minutesToTime(opening, short: true)}')
      else if (nextOpenDay != null) ...[
        TextSpan(text: ' – Ouvre ${daysFull[nextOpenDay!.dayOfWeek - 1]}'),
        if (nextOpenDay!.opening != null)
          TextSpan(
              text:
                  ' à ${minutesToTime(nextOpenDay!.opening, short: true)}'),
      ],
    ]));
  }
}

class SchedulesPreview extends StatelessWidget {
  final List<Schedule> schedules;

  const SchedulesPreview({super.key, this.schedules = const []});

  @override
  Widget build(BuildContext context) {
    final currentDay = DateTime.now().weekday;

    Schedule? today;
    for (final schedule in schedules) {
      if (schedule.dayOfWeek == currentDay) {
        today = schedule;
        break;
      }
    }
    final nextOpenDay = _findNextOpenDay(schedules, currentDay);

    if (today == null) {
      return const _Open();
    }

    if (today.closed) {
      return _Closed(today: today, nextOpenDay: nextOpenDay);
    }
    if (today.opening != null) {
      if (inHours(today.opening, today.closing)) {
        return _Open(today: today);
      }
      return _Closed(today: today, nextOpenDay: nextOpenDay);
    }
    return _Open(today: today);
  }
}
