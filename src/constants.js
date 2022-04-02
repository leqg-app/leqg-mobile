// import { Appearance } from 'react-native';
// import { DefaultTheme, DarkTheme } from 'react-native-paper';
import { DefaultTheme } from 'react-native-paper';

export const isDark = false; // Appearance.getColorScheme() === 'dark';
const Theme = DefaultTheme; // isDark ? DarkTheme : DefaultTheme;

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
  ...Theme,
  colors: {
    ...Theme.colors,
    primary: '#163033',
    bright: '#2d4447',
    accent: '#f9a825',
    danger: '#B00020',
  },
};

export const DEFAULT_MAP = {
  CENTER_COORDINATES: [2.3419, 48.8603], // Paris
  ZOOM_LEVEL: 4,
};
