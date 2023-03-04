// import { Appearance } from 'react-native';
import { DefaultTheme, DarkTheme } from 'react-native-paper';

export const isDark = false; // Appearance.getColorScheme() === 'dark';
const PaperTheme = isDark ? DarkTheme : DefaultTheme;

export const daysShort = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const daysFull = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
];

export const theme = {
  ...PaperTheme,
  colors: {
    ...PaperTheme.colors,
    primary: '#163033',
    primaryContainer: 'red',
    secondaryContainer: '#163033',
    onSecondaryContainer: '#fff',
    bright: '#2d4447',
    accent: '#f9a825',
    danger: '#B00020',
  },
};

export const DEFAULT_MAP = {
  CENTER_COORDINATES: [2.3419, 48.8603], // Paris
  ZOOM_LEVEL: 4,
};

export const LEVELS = [
  0,
  10,
  100,
  500,
  1000,
  5000,
  10000,
  20000,
  50000,
  Infinity,
];
