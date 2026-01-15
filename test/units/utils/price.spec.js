import { displayPrice, parsePrice } from '../../../src/utils/price';

const displayPriceData = [
  { input: 0, output: '' },
  { input: 1, output: '1' },
  { input: 1.0, output: '1' },
  { input: 1.4, output: '1,40' },
  { input: 0.99, output: '0,99' },
];

describe('displayPrice', () => {
  for (const { input, output } of displayPriceData) {
    it(String(input), () => {
      expect(displayPrice(input)).toBe(output);
    });
  }
});

const parsePriceData = [
  { input: '1', output: 1 },
  { input: '1,', output: 1 },
  { input: '1,00', output: 1 },
  { input: '1,1', output: 1.1 },
  { input: '1,99', output: 1.99 },
  { input: '1.1', output: 1.1 },
];

describe('parsePrice', () => {
  for (const { input, output } of parsePriceData) {
    it(String(input), () => {
      expect(parsePrice(input)).toBe(output);
    });
  }
});
