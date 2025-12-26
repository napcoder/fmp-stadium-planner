import Store from '../src/store';
import { Stadium } from '../src/stadium';
describe('Store', () => {
  it('should notify listeners on state change', () => {
    const s1 = new Stadium({ standing: 1, standard: 1, covered: 1, vip: 1 });
    const s2 = new Stadium({ standing: 2, standard: 2, covered: 2, vip: 2 });
    const store = new Store({ currentStadium: s1, plannedStadium: s1, baseTicketPrice: 10 });
    let called = 0;
    store.subscribe((state, prev) => {
      called++;
    });
    store.setState({ currentStadium: s2 });
    expect(called).toBe(2);
    store.setState({ baseTicketPrice: 15 });
    expect(called).toBe(3);
    store.setState({ plannedStadium: s2 });
    expect(called).toBe(4);
  });
  it('should not notify if layout is unchanged', () => {
    const current = new Stadium({ standing: 1, standard: 1, covered: 1, vip: 1 });
    const planned = new Stadium({ standing: 2, standard: 2, covered: 2, vip: 2 });
    const store = new Store({ currentStadium: current, plannedStadium: planned, baseTicketPrice: 10 });
    let called = 0;
    store.subscribe(() => { called++; });
    // setState with same layout
    store.setState({ currentStadium: new Stadium(current.getLayout()) });
    store.setState({ plannedStadium: new Stadium(planned.getLayout()) });
    store.setState({ baseTicketPrice: 10 });
    expect(called).toBe(1); // Only initial call
  });
  it('should allow unsubscribe', () => {
    const s1 = new Stadium({ standing: 1, standard: 1, covered: 1, vip: 1 });
    const s2 = new Stadium({ standing: 2, standard: 2, covered: 2, vip: 2 });
    const store = new Store({ currentStadium: s1, plannedStadium: s1, baseTicketPrice: 10 });
    let called = 0;
    const unsub = store.subscribe(() => { called++; });
    unsub();
    store.setState({ currentStadium: s2 });
    expect(called).toBe(1); // Only initial call
  });
});