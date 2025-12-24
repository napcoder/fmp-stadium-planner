import { EnhancedStadium, Stadium } from '../src/stadium';

describe('EnhancedStadium', () => {
  it('should calculate max income with baseTicketPrice', () => {
    const layout = { standing: 2, standard: 2, covered: 2, vip: 2 };
    const s = new EnhancedStadium(layout, 5);
    // (2*1 + 2*2 + 2*4 + 2*12) = 2 + 4 + 8 + 24 = 38; 38*5 = 190
    expect(s.calcMaxIncome()).toBe(190);
  });
  it('should clone itself', () => {
    const s = new EnhancedStadium({ standing: 1, standard: 2, covered: 3, vip: 4 }, 10);
    const clone = s.clone();
    expect(clone).not.toBe(s);
    expect(clone.getLayout()).toEqual(s.getLayout());
    expect(clone.baseTicketPrice).toBe(s.baseTicketPrice);
  });
  it('should create from Stadium', () => {
    const base = new Stadium({ standing: 3, standard: 2, covered: 1, vip: 0 });
    const e = EnhancedStadium.fromStadium(base, 7);
    expect(e.getLayout()).toEqual(base.getLayout());
    expect(e.baseTicketPrice).toBe(7);
  });
});