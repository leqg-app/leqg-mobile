const date = new Date();
const dayOfWeek = date.getDay() ? date.getDay() - 1 : 6;
const today = ['object', ['at', dayOfWeek, ['array', ['get', 'schedules']]]];

const time = date.getHours() * 60 + date.getMinutes();

export const OPEN_STORE_EXPRESSION = [
  'all',
  ['!', ['get', 'closed', today]],
  [
    'any',
    ['!', ['to-boolean', ['get', 'opening', today]]], // if no schedule
    // else
    [
      'case',
      ['<', ['get', 'opening', today], ['get', 'closing', today]],
      // if open < close (classic)
      [
        'all',
        ['>', time, ['get', 'opening', today]], // time > open
        ['<', time, ['get', 'closing', today]], // AND time < close
      ],
      // else open > close (reverted)
      [
        'any',
        ['<', time, ['get', 'closing', today]], // time < close
        ['>', time, ['get', 'opening', today]], // OR time > open
      ],
    ],
  ],
];
