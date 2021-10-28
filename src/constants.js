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
    accent: '#d1a03c',
  },
};
