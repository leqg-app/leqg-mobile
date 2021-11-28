import { DefaultTheme } from 'react-native-paper';

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
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#163033',
    bright: '#2d4447',
    accent: '#f9a825',
    danger: '#B00020',
  },
};
