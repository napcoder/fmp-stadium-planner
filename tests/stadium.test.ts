import { Stadium, SeatsLayout } from '../src/stadium';

describe('Stadium', () => {
  it('should calculate max income correctly', () => {
    const layout: SeatsLayout = { standing: 100, standard: 50, covered: 25, vip: 10 };
    const stadium = new Stadium(layout);
    // 100*1 + 50*2 + 25*4 + 10*12 = 100 + 100 + 100 + 120 = 420
    expect(stadium.calcMaxIncome(1)).toBe(420);
    expect(stadium.calcMaxIncome(10)).toBe(4200);
  });

  it('should handle zero seats', () => {
    const layout: SeatsLayout = { standing: 0, standard: 0, covered: 0, vip: 0 };
    const stadium = new Stadium(layout);
    expect(stadium.calcMaxIncome(100)).toBe(0);
  });

  it('should return correct layout from getLayout()', () => {
    const layout: SeatsLayout = { standing: 5, standard: 10, covered: 15, vip: 20 };
    const stadium = new Stadium(layout);
    expect(stadium.getLayout()).toEqual(layout);
    expect(stadium.vip).toBe(20);
    expect(stadium.covered).toBe(15);
    expect(stadium.standard).toBe(10);
    expect(stadium.standing).toBe(5);
  });
});
