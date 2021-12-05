import { formatPrice } from '../../src/utils/formatPrice';

const tests = [
  { input: '1', output: '1' },
  { input: '0', output: '0' },
  { input: '0,1', output: '0,10' },
  { input: '1,', output: '1' },
  { input: '1,00', output: '1' },
  { input: '1.00', output: '1' },
  { input: '1,9', output: '1,90' },
  { input: '1.9', output: '1,90' },
  { input: '1,99', output: '1,99' },
  { input: '1.99', output: '1,99' },
  { input: 1, output: '1' },
  { input: 1.4, output: '1,40' },
];

describe('formatPrice', () => {
  for (const test of tests) {
    it(String(test.input), () => {
      expect(formatPrice(test.input)).toBe(test.output);
    });
  }
});
