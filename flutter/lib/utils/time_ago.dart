/// Équivalent français de date-fns formatDistance(date, now, {addSuffix: true}).
String formatDistanceToNow(DateTime date) {
  final now = DateTime.now();
  final diff = now.difference(date);
  final future = diff.isNegative;
  final d = diff.abs();

  String core;
  if (d.inSeconds < 30) {
    core = 'moins d’une minute';
  } else if (d.inMinutes < 1) {
    core = '1 minute';
  } else if (d.inMinutes < 45) {
    core = '${d.inMinutes} minute${d.inMinutes > 1 ? 's' : ''}';
  } else if (d.inMinutes < 90) {
    core = 'environ 1 heure';
  } else if (d.inHours < 24) {
    core = 'environ ${d.inHours} heures';
  } else if (d.inDays < 2) {
    core = '1 jour';
  } else if (d.inDays < 30) {
    core = '${d.inDays} jours';
  } else if (d.inDays < 45) {
    core = 'environ 1 mois';
  } else if (d.inDays < 365) {
    final months = (d.inDays / 30).round();
    core = '$months mois';
  } else {
    final years = (d.inDays / 365).floor();
    core = years <= 1 ? 'environ 1 an' : 'environ $years ans';
  }

  return future ? 'dans $core' : 'il y a $core';
}
