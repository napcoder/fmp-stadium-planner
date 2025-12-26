import { UpgradeManager } from '../src/upgrade-manager';
import { Stadium } from '../src/stadium';

describe('UpgradeManager', () => {
  it('should create from Stadium', () => {
    const base = new Stadium({ standing: 3, standard: 2, covered: 1, vip: 0 });
    const e = UpgradeManager.fromStadium(base, 7);
    expect(e.currentStadium.getLayout()).toEqual(base.getLayout());
    expect(e.plannedStadium.getLayout()).toEqual(base.getLayout());
    expect(e.baseTicketPrice).toBe(7);
  });

  describe('building cost and time methods', () => {
    let manager: UpgradeManager;
    beforeEach(() => {
      // Use a known config for Stadium.config multipliers
      // Assume Stadium.config is set as in production
      manager = new UpgradeManager(
        { standing: 100, standard: 50, covered: 20, vip: 5 },
        30,
        { standing: 120, standard: 60, covered: 25, vip: 7 }
      );
    });

    it('calculates VIP building cost', () => {
      const cost = manager.getVipBuildingCost();
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('calculates Covered building cost', () => {
      const cost = manager.getCoveredBuildingCost();
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('calculates Standard building cost', () => {
      const cost = manager.getStandardBuildingCost();
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('calculates Standing building cost', () => {
      const cost = manager.getStandingBuildingCost();
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('calculates total building cost', () => {
      const total = manager.getTotalBuildingCost();
      const sum = manager.getVipBuildingCost() + manager.getCoveredBuildingCost() + manager.getStandardBuildingCost() + manager.getStandingBuildingCost();
      expect(total).toBe(sum);
    });

    it('calculates VIP time to build', () => {
      const t = manager.getVipTimeToBuild();
      expect(typeof t).toBe('number');
      expect(t).toBeGreaterThanOrEqual(1);
    });

    it('calculates Covered time to build', () => {
      const t = manager.getCoveredTimeToBuild();
      expect(typeof t).toBe('number');
      expect(t).toBeGreaterThanOrEqual(1);
    });

    it('calculates Standard time to build', () => {
      const t = manager.getStandardTimeToBuild();
      expect(typeof t).toBe('number');
      expect(t).toBeGreaterThanOrEqual(1);
    });

    it('calculates Standing time to build', () => {
      const t = manager.getStandingTimeToBuild();
      expect(typeof t).toBe('number');
      expect(t).toBeGreaterThanOrEqual(1);
    });

    it('calculates total time to build as max of all', () => {
      const total = manager.getTotalTimeToBuild();
      const times = [
        manager.getVipTimeToBuild(),
        manager.getCoveredTimeToBuild(),
        manager.getStandardTimeToBuild(),
        manager.getStandingTimeToBuild()
      ];
      expect(total).toBe(Math.max(...times));
    });
  });
});