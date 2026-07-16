import 'package:flutter/material.dart';

import '../../constants.dart';
import '../../models/models.dart';
import '../../utils/time.dart';

/// Port de src/containers/Store/Schedules.js : tableau des horaires de la
/// semaine (+ colonne Happy Hour si besoin).
String _time(int? open, int? close) =>
    open == null ? '-' : '${minutesToTime(open)}-${minutesToTime(close)}';

class Schedules extends StatelessWidget {
  final List<Schedule> schedules;

  const Schedules({super.key, required this.schedules});

  @override
  Widget build(BuildContext context) {
    final days = List<Schedule>.generate(
        7, (i) => Schedule(dayOfWeek: i + 1, closed: false));
    for (final schedule in schedules) {
      days[schedule.dayOfWeek - 1] = schedule;
    }
    final hasSchedule = days
        .any((day) => day.opening != null || day.openingSpecial != null);
    final hasSpecial =
        hasSchedule && days.any((day) => day.openingSpecial != null);
    final today = DateTime.now().weekday;

    const cellWidth = 90.0;
    const bold = TextStyle(fontWeight: FontWeight.bold, letterSpacing: -0.5);

    Widget cell(String text, {bool isToday = false}) => SizedBox(
          width: cellWidth,
          child: Text(text,
              textAlign: TextAlign.center, style: isToday ? bold : null),
        );

    return Column(
      children: [
        if (hasSpecial)
          const Padding(
            padding: EdgeInsets.only(bottom: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                SizedBox(width: cellWidth),
                SizedBox(
                    width: cellWidth,
                    child: Text('Ouverture', textAlign: TextAlign.center)),
                SizedBox(
                    width: cellWidth,
                    child: Text('Happy Hour', textAlign: TextAlign.center)),
              ],
            ),
          ),
        for (final day in days)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                SizedBox(
                  width: cellWidth,
                  child: Text(daysFull[day.dayOfWeek - 1],
                      style: today == day.dayOfWeek ? bold : null),
                ),
                if (day.closed) ...[
                  cell('Fermé', isToday: today == day.dayOfWeek),
                  if (hasSpecial) const SizedBox(width: cellWidth),
                ] else ...[
                  cell(_time(day.opening, day.closing),
                      isToday: today == day.dayOfWeek),
                  if (hasSpecial)
                    cell(_time(day.openingSpecial, day.closingSpecial),
                        isToday: today == day.dayOfWeek),
                ],
              ],
            ),
          ),
      ],
    );
  }
}
