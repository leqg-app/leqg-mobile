/// Port de src/utils/time.js.
String _pad2(int n) => n.toString().padLeft(2, '0');

String minutesToTime(int? minutes, {bool short = false}) {
  if (minutes == null || minutes == 0) {
    return short ? '00h' : '00:00';
  }
  final hour = minutes ~/ 60;
  final minute = minutes % 60;
  if (short && minute == 0) {
    return '${hour}h';
  }
  return '${short ? hour : _pad2(hour)}:${_pad2(minute)}';
}

bool inHours(int? start, int? end) {
  if (start == null || end == null) {
    return false;
  }
  final date = DateTime.now();
  final now = date.hour * 60 + date.minute;
  if (start > end) {
    // 17h - 2h
    return now < end || start < now;
  }
  // 10h - 20h
  return start < now && now < end;
}
