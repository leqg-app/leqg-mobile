import '../models/models.dart';

/// Port des fonctions de src/store/atoms.js relatives au filtre horaires.

/// Vérifie si la plage [start1, end1] du bar couvre la plage filtre
/// [start2, end2] (les horaires filtre peuvent dépasser minuit : >= 1440).
bool storeCoversFilterTime(int start1, int end1, int start2, int end2) {
  // Normaliser les horaires du filtre (convertir en 0-1439)
  final filterStartNorm = start2 >= 1440 ? start2 - 1440 : start2;
  final filterEndNorm = end2 >= 1440 ? end2 - 1440 : end2;

  // Cas 1 : le filtre est entièrement après minuit
  if (start2 >= 1440 && end2 >= 1440) {
    if (start1 > end1) {
      // Store chevauche minuit (ex : 22h-3h)
      return 0 <= filterStartNorm && filterEndNorm <= end1;
    } else {
      return start1 <= filterStartNorm && filterEndNorm <= end1;
    }
  }

  // Cas 2 : le filtre est entièrement avant minuit
  if (end2 < 1440) {
    if (start1 <= end1) {
      return start1 <= start2 && end2 <= end1;
    }
    // Store chevauche minuit
    return start1 <= start2 && end2 <= 1439;
  }

  // Cas 3 : le filtre chevauche minuit
  if (start1 <= end1) {
    return false;
  } else {
    return start1 <= start2 && filterEndNorm <= end1;
  }
}

/// Vérifie si un store correspond au filtre horaires.
bool storeMatchesScheduleFilter(Store store, ScheduleFilter? scheduleFilter) {
  if (scheduleFilter == null || store.schedules.isEmpty) {
    return true;
  }

  final days = scheduleFilter.days;
  final startTime = scheduleFilter.startTime;
  final endTime = scheduleFilter.endTime;

  Schedule? findDay(int dayOfWeek) {
    for (final s in store.schedules) {
      if (s.dayOfWeek == dayOfWeek) return s;
    }
    return null;
  }

  for (final dayOfWeek in days) {
    final schedule = findDay(dayOfWeek);

    if (schedule == null || schedule.closed) {
      continue;
    }

    if (schedule.opening != null && schedule.closing != null) {
      if (storeCoversFilterTime(
          schedule.opening!, schedule.closing!, startTime, endTime)) {
        return true;
      }
    }

    // Happy hour
    if (schedule.openingSpecial != null && schedule.closingSpecial != null) {
      if (storeCoversFilterTime(schedule.openingSpecial!,
          schedule.closingSpecial!, startTime, endTime)) {
        return true;
      }
    }
  }

  // Si le filtre commence après minuit, vérifier aussi le jour précédent
  if (startTime >= 1440) {
    for (final dayOfWeek in days) {
      final previousDay = dayOfWeek == 1 ? 7 : dayOfWeek - 1;
      final prevSchedule = findDay(previousDay);

      if (prevSchedule == null || prevSchedule.closed) {
        continue;
      }

      if (prevSchedule.opening != null &&
          prevSchedule.closing != null &&
          prevSchedule.opening! > prevSchedule.closing!) {
        if (storeCoversFilterTime(
            prevSchedule.opening!, prevSchedule.closing!, startTime, endTime)) {
          return true;
        }
      }

      if (prevSchedule.openingSpecial != null &&
          prevSchedule.closingSpecial != null &&
          prevSchedule.openingSpecial! > prevSchedule.closingSpecial!) {
        if (storeCoversFilterTime(prevSchedule.openingSpecial!,
            prevSchedule.closingSpecial!, startTime, endTime)) {
          return true;
        }
      }
    }
  }

  return false;
}

/// Port de isStoreOpenAt (ScheduleFilter.js).
bool isStoreOpenAt(Store store, int dayOfWeek, int timeInMinutes) {
  if (store.schedules.isEmpty) {
    return false;
  }

  final normalizedTime =
      timeInMinutes >= 1440 ? timeInMinutes - 1440 : timeInMinutes;
  final isAfterMidnight = timeInMinutes >= 1440;

  Schedule? findDay(int day) {
    for (final s in store.schedules) {
      if (s.dayOfWeek == day) return s;
    }
    return null;
  }

  final schedule = findDay(dayOfWeek);

  if (schedule != null && !schedule.closed) {
    if (schedule.opening != null && schedule.closing != null) {
      final opening = schedule.opening!;
      final closing = schedule.closing!;
      if (opening <= closing) {
        if (!isAfterMidnight &&
            normalizedTime >= opening &&
            normalizedTime <= closing) {
          return true;
        }
      } else {
        // Chevauche minuit
        if (!isAfterMidnight && normalizedTime >= opening) {
          return true;
        }
        if (isAfterMidnight && normalizedTime <= closing) {
          return true;
        }
      }
    }

    // Happy hour
    if (schedule.openingSpecial != null && schedule.closingSpecial != null) {
      final openingSpecial = schedule.openingSpecial!;
      final closingSpecial = schedule.closingSpecial!;
      if (openingSpecial <= closingSpecial) {
        if (!isAfterMidnight &&
            normalizedTime >= openingSpecial &&
            normalizedTime <= closingSpecial) {
          return true;
        }
      } else {
        if (!isAfterMidnight && normalizedTime >= openingSpecial) {
          return true;
        }
        if (isAfterMidnight && normalizedTime <= closingSpecial) {
          return true;
        }
      }
    }
  }

  // Vérifier le jour précédent si on regarde après minuit
  if (isAfterMidnight) {
    final previousDay = dayOfWeek == 1 ? 7 : dayOfWeek - 1;
    final prevSchedule = findDay(previousDay);

    if (prevSchedule != null && !prevSchedule.closed) {
      if (prevSchedule.opening != null &&
          prevSchedule.closing != null &&
          prevSchedule.opening! > prevSchedule.closing!) {
        if (normalizedTime <= prevSchedule.closing!) {
          return true;
        }
      }

      if (prevSchedule.openingSpecial != null &&
          prevSchedule.closingSpecial != null &&
          prevSchedule.openingSpecial! > prevSchedule.closingSpecial!) {
        if (normalizedTime <= prevSchedule.closingSpecial!) {
          return true;
        }
      }
    }
  }

  return false;
}
