// Port de src/constants.js et app.json
const String apiEndpoint = 'https://api.leqg.app';
const String appVersion = '4.1.0-beta.9';

const daysShort = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const daysFull = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
];

class DefaultMap {
  static const centerCoordinates = [2.3419, 48.8603]; // Paris
  static const zoomLevel = 4.0;
}

const List<double> levels = [
  0,
  10,
  100,
  500,
  1000,
  5000,
  10000,
  20000,
  50000,
  double.infinity,
];
