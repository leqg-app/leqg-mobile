const date = new Date();
const dayOfWeek = date.getDay() ? date.getDay() - 1 : 6;
const today = ['object', ['at', dayOfWeek, ['array', ['get', 'schedules']]]];

const time = date.getHours() * 60 + date.getMinutes();

export const CHEAPEST_PRICE_EXPRESSION = [
  'case',
  [
    'any',
    [
      'all',
      ['>', 0, ['get', 'specialPrice']], // if special price > 0 AND
      [
        'case',
        [
          '<',
          ['get', 'openingSpecial', today],
          ['get', 'closingSpecial', today],
        ],
        // if open < close (classic)
        [
          'all',
          ['>', time, ['get', 'openingSpecial', today]], // time > open
          ['<', time, ['get', 'closingSpecial', today]], // AND time < close
        ],
        // else open > close (reverted)
        [
          'any',
          ['<', time, ['get', 'closingSpecial', today]], // time < close
          ['>', time, ['get', 'openingSpecial', today]], // OR time > open
        ],
      ],
    ],
    ['==', 0, ['get', 'price']], // or if no regular price
  ],
  // then display special price
  ['get', 'specialPrice'],
  // else display price
  ['get', 'price'],
];

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
