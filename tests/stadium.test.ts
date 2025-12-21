import { Stadium } from '../src/stadium';

describe('Stadium', () => {
  it('should calculate max income correctly', () => {
    const stadium = new Stadium(100, 50, 25, 10);
    // 100*1 + 50*2 + 25*4 + 10*12 = 100 + 100 + 100 + 120 = 420
    expect(stadium.calcMaxIncome(1)).toBe(420);
    expect(stadium.calcMaxIncome(10)).toBe(4200);
  });

  it('should handle zero seats', () => {
    const stadium = new Stadium(0, 0, 0, 0);
    expect(stadium.calcMaxIncome(100)).toBe(0);
  });
});
