import { EnhancedStadium } from '../src/stadium';
import Store from '../src/store';
describe('Store', () => {
  it('should notify listeners on state change', () => {
    const s1 = new EnhancedStadium({ standing: 1, standard: 1, covered: 1, vip: 1 }, 10);
    const s2 = new EnhancedStadium({ standing: 2, standard: 2, covered: 2, vip: 2 }, 20);
    const store = new Store({ currentStadium: s1, plannedStadium: null });
    let called = 0;
    store.subscribe((state, prev) => {
      called++;
    });
    store.setState({ currentStadium: s2 });
    expect(called).toBeGreaterThan(0);
  });
  it('should not notify if layout is unchanged', () => {
    const s1 = new EnhancedStadium({ standing: 1, standard: 1, covered: 1, vip: 1 }, 10);
    const store = new Store({ currentStadium: s1, plannedStadium: null });
    let called = 0;
    store.subscribe(() => { called++; });
    // setState with same layout
    store.setState({ currentStadium: s1 });
    expect(called).toBe(1); // Only initial call
  });
  it('should allow unsubscribe', () => {
    const s1 = new EnhancedStadium({ standing: 1, standard: 1, covered: 1, vip: 1 }, 10);
    const s2 = new EnhancedStadium({ standing: 2, standard: 2, covered: 2, vip: 2 }, 20);
    const store = new Store({ currentStadium: s1, plannedStadium: null });
    let called = 0;
    const unsub = store.subscribe(() => { called++; });
    unsub();
    store.setState({ currentStadium: s2 });
    expect(called).toBe(1); // Only initial call
  });
});