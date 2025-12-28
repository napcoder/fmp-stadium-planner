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

  describe('Stadium.isDifferentLayout', () => {
    it('should detect different layouts', () => {
      const a = new Stadium({ standing: 1, standard: 2, covered: 3, vip: 4 });
      const b = new Stadium({ standing: 1, standard: 2, covered: 3, vip: 5 });
      expect(a.isDifferentLayout(b)).toBe(true);
      expect(b.isDifferentLayout(a)).toBe(true);
    });
    it('should detect identical layouts', () => {
      const a = new Stadium({ standing: 10, standard: 20, covered: 30, vip: 40 });
      const b = new Stadium({ standing: 10, standard: 20, covered: 30, vip: 40 });
      expect(a.isDifferentLayout(b)).toBe(false);
    });
  });
  
  describe('Stadium.getMaintainCost', () => {
    it('should calculate maintain cost correctly', () => {
      const stadium = new Stadium({ standing: 11040, standard: 5520, covered: 2760, vip: 690 });
      const cost = stadium.getMaintainCost();
      expect(cost).toBe(60600);
    });
    it('should calculate maintain cost for basic layout', () => {
      const stadium = new Stadium({ standing: 4000, standard: 2000, covered: 1000, vip: 0 });
      const cost = stadium.getMaintainCost();
      expect(cost).toBe(6900);
    });
    it('should return zero for zero seats', () => {
      const stadium = new Stadium({ standing: 0, standard: 0, covered: 0, vip: 0 });
      expect(stadium.getMaintainCost()).toBe(0);
    });
  });

  describe('Stadium.clone', () => {
    it('should create an identical copy', () => {
      const original = new Stadium({ standing: 5, standard: 10, covered: 15, vip: 20 });
      const clone = original.clone();
      expect(clone).not.toBe(original);
      expect(clone.getLayout()).toEqual(original.getLayout());
    });
  });

  describe('Stadium.getRatio', () => {
    it('should return correct seats ratio when total seats are zero', () => {
      const stadium = new Stadium({ standing: 0, standard: 0, covered: 0, vip: 0 });
      const ratio = stadium.getRatio();
      expect(ratio.standing).toBe(0);
      expect(ratio.standard).toBe(0);
      expect(ratio.covered).toBe(0);
      expect(ratio.vip).toBe(0);
    });
    it('should return correct seats ratio for simple seats', () => {
      const stadium = new Stadium({ standing: 16, standard: 8, covered: 4, vip: 1 });
      const ratio = stadium.getRatio();
      expect(ratio.standing).toBe(16);
      expect(ratio.standard).toBe(8);
      expect(ratio.covered).toBe(4);
      expect(ratio.vip).toBe(1);
    });
    it('should support zero seats in some categories', () => {
      const stadium = new Stadium({ standing: 10, standard: 0, covered: 5, vip: 0 });
      const ratio = stadium.getRatio();
      expect(ratio.standing).toBe(2);
      expect(ratio.standard).toBe(0);
      expect(ratio.covered).toBe(1);
      expect(ratio.vip).toBe(0);
    });
    it.each([
      { layout: { standing: 4000, standard: 2000, covered: 1000, vip: 0 }, expected: { standing: 4, standard: 2, covered: 1, vip: 0 } },
      { layout: { standing: 11040, standard: 5520, covered: 2760, vip: 690 }, expected: { standing: 16, standard: 8, covered: 4, vip: 1 } },
      { layout: { standing: 1000, standard: 1000, covered: 1000, vip: 1000 }, expected: { standing: 1, standard: 1, covered: 1, vip: 1 } },
    ])('should return correct seats ratio for $layout', ({ layout, expected }) => {
      const stadium = new Stadium(layout);
      const ratio = stadium.getRatio();
      expect(ratio.standing).toBe(expected.standing);
      expect(ratio.standard).toBe(expected.standard);
      expect(ratio.covered).toBe(expected.covered);
      expect(ratio.vip).toBe(expected.vip);
    });
    it('should use rounded ratios', () => {
      const stadium = new Stadium({ standing: 162, standard: 84, covered: 41, vip: 10 });
      const ratio = stadium.getRatio();
      expect(ratio.standing).toBe(16);
      expect(ratio.standard).toBe(8);
      expect(ratio.covered).toBe(4);
      expect(ratio.vip).toBe(1);
    });
  });
});
