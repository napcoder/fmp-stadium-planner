import { UpgradeManager } from '../src/upgrade-manager';
import { SeatsLayout, Stadium } from '../src/stadium';

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
    let currentSeats: SeatsLayout;
    let plannedSeats: SeatsLayout;
    beforeEach(() => {
      // Use a known config for Stadium.config multipliers
      // Assume Stadium.config is set as in production
      currentSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
      plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
      manager = new UpgradeManager(
        currentSeats,
        28,
      );
    });

    it.each([
      {increment: -1, expectedCost: 0},
      {increment: 0, expectedCost: 0},
      {increment: 1, expectedCost: 12500},
      {increment: 10, expectedCost: 105000},
      {increment: 100, expectedCost: 1110000},
      {increment: 1000, expectedCost: 17850000},
    ])('calculates VIP building cost increment=$increment, expectedCost=$expectedCost', ({increment, expectedCost}) => {
      plannedSeats.vip += increment; // increase VIP seats
      manager.setPlannedLayout(plannedSeats);
      const cost = manager.getVipBuildingCost();
      expect(cost).toBe(expectedCost);
    });

    it.each([
      {increment: -1, expectedCost: 0},
      {increment: 0, expectedCost: 0},
      {increment: 1, expectedCost: 5000},
      {increment: 10, expectedCost: 47500},
      {increment: 100, expectedCost: 470000},
      {increment: 1000, expectedCost: 5435000},
    ])('calculates covered building cost increment=$increment, expectedCost=$expectedCost', ({increment, expectedCost}) => {
      plannedSeats.covered += increment;
      manager.setPlannedLayout(plannedSeats);
      const cost = manager.getCoveredBuildingCost();
      expect(cost).toBe(expectedCost);
    });

    it.each([
      {increment: -1, expectedCost: 0},
      {increment: 0, expectedCost: 0},
      {increment: 1, expectedCost: 2500},
      {increment: 10, expectedCost: 25000},
      {increment: 100, expectedCost: 232500},
      {increment: 1000, expectedCost: 2510000},
    ])('calculates standard building cost increment=$increment, expectedCost=$expectedCost', ({increment, expectedCost}) => {
      plannedSeats.standard += increment;
      manager.setPlannedLayout(plannedSeats);
      const cost = manager.getStandardBuildingCost();
      expect(cost).toBe(expectedCost);
    });

    it.each([
      {increment: -1, expectedCost: 0},
      {increment: 0, expectedCost: 0},
      {increment: 1, expectedCost: 2500},
      {increment: 10, expectedCost: 12500},
      {increment: 100, expectedCost: 117500},
      {increment: 1000, expectedCost: 1202500},
    ])('calculates standing building cost increment=$increment, expectedCost=$expectedCost', ({increment, expectedCost}) => {
      plannedSeats.standing += increment;
      manager.setPlannedLayout(plannedSeats);
      const cost = manager.getStandingBuildingCost();
      expect(cost).toBe(expectedCost);
    });


    describe('getTotalBuildingCost', () => {
      beforeEach(() => {
        currentSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        manager = new UpgradeManager(currentSeats, 28);
      });

      it('returns 0 when no seats are changed', () => {
        manager.setPlannedLayout(plannedSeats);
        expect(manager.getTotalBuildingCost()).toBe(0);
      });

      it.each([
        {sector: 'vip', increment: 1, expected: 12500},
        {sector: 'vip', increment: 10, expected: 105000},
        {sector: 'vip', increment: 100, expected: 1110000},
        {sector: 'vip', increment: 1000, expected: 17850000},
        {sector: 'covered', increment: 1, expected: 5000},
        {sector: 'covered', increment: 10, expected: 47500},
        {sector: 'covered', increment: 100, expected: 470000},
        {sector: 'covered', increment: 1000, expected: 5435000},
        {sector: 'standard', increment: 1, expected: 2500},
        {sector: 'standard', increment: 10, expected: 25000},
        {sector: 'standard', increment: 100, expected: 232500},
        {sector: 'standard', increment: 1000, expected: 2510000},
        {sector: 'standing', increment: 1, expected: 2500},
        {sector: 'standing', increment: 10, expected: 12500},
        {sector: 'standing', increment: 100, expected: 117500},
        {sector: 'standing', increment: 1000, expected: 1202500},
      ])('returns correct total cost for +$increment $sector seat(s)', ({sector, increment, expected}) => {
        // Reset plannedSeats
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats[sector as keyof SeatsLayout] += increment;
        manager.setPlannedLayout(plannedSeats);
        expect(manager.getTotalBuildingCost()).toBe(expected);
      });

      it('returns sum of all sector costs for multiple changes', () => {
        plannedSeats.vip += 2;
        plannedSeats.covered += 3;
        plannedSeats.standard += 4;
        plannedSeats.standing += 5;
        manager.setPlannedLayout(plannedSeats);
        const expected = manager.getVipBuildingCost() + manager.getCoveredBuildingCost() + manager.getStandardBuildingCost() + manager.getStandingBuildingCost();
        expect(manager.getTotalBuildingCost()).toBe(expected);
      });
    });

    describe('building time methods', () => {
      it.each([
        {increment: -100, expected: 5},
        {increment: -1, expected: 1},
        {increment: 0, expected: 0},
        {increment: 1, expected: 1},
        {increment: 10, expected: 1},
        {increment: 100, expected: 5},
        {increment: 1000, expected: 41},
      ])('VIP: returns correct build time for +$increment seat(s)', ({increment, expected}) => {
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats.vip += increment;
        manager.setPlannedLayout(plannedSeats);
        expect(manager.getVipTimeToBuild()).toBe(expected); // placeholder, replace with actual value if needed
      });

      it.each([
        {increment: -100, expected: 3},
        {increment: -1, expected: 1},
        {increment: 0, expected: 0},
        {increment: 1, expected: 1},
        {increment: 10, expected: 1},
        {increment: 100, expected: 3},
        {increment: 1000, expected: 21},
      ])('Covered: returns correct build time for +$increment seat(s)', ({increment, expected}) => {
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats.covered += increment;
        manager.setPlannedLayout(plannedSeats);
        expect(manager.getCoveredTimeToBuild()).toBe(expected); // placeholder, replace with actual value if needed
      });

      it.each([
        {increment: -100, expected: 2},
        {increment: -1, expected: 1},
        {increment: 0, expected: 0},
        {increment: 1, expected: 1},
        {increment: 10, expected: 1},
        {increment: 100, expected: 2},
        {increment: 1000, expected: 11},
      ])('Standard: returns correct build time for +$increment seat(s)', ({increment, expected}) => {
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats.standard += increment;
        manager.setPlannedLayout(plannedSeats);
        expect(manager.getStandardTimeToBuild()).toBe(expected); // placeholder, replace with actual value if needed
      });

      it.each([
        {increment: -100, expected: 2},
        {increment: -1, expected: 1},
        {increment: 0, expected: 0},
        {increment: 1, expected: 1},
        {increment: 10, expected: 1},
        {increment: 100, expected: 2},
        {increment: 1000, expected: 6},
      ])('Standing: returns correct build time for +$increment seat(s)', ({increment, expected}) => {
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats.standing += increment;
        manager.setPlannedLayout(plannedSeats);
        expect(manager.getStandingTimeToBuild()).toBe(expected); // placeholder, replace with actual value if needed
      });
      beforeEach(() => {
        currentSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        manager = new UpgradeManager(currentSeats, 28);
      });

      
    });

    describe('getTotalTimeToBuild', () => {
      beforeEach(() => {
        currentSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        manager = new UpgradeManager(currentSeats, 28);
      });

      it.each([
        // VIP
        {sector: 'vip', increment: -100, expected: 5},
        {sector: 'vip', increment: -1, expected: 1},
        {sector: 'vip', increment: 0, expected: 0},
        {sector: 'vip', increment: 1, expected: 1},
        {sector: 'vip', increment: 10, expected: 1},
        {sector: 'vip', increment: 100, expected: 5},
        {sector: 'vip', increment: 1000, expected: 41},
        // Covered
        {sector: 'covered', increment: -100, expected: 3},
        {sector: 'covered', increment: -1, expected: 1},
        {sector: 'covered', increment: 0, expected: 0},
        {sector: 'covered', increment: 1, expected: 1},
        {sector: 'covered', increment: 10, expected: 1},
        {sector: 'covered', increment: 100, expected: 3},
        {sector: 'covered', increment: 1000, expected: 21},
        // Standard
        {sector: 'standard', increment: -100, expected: 2},
        {sector: 'standard', increment: -1, expected: 1},
        {sector: 'standard', increment: 0, expected: 0},
        {sector: 'standard', increment: 1, expected: 1},
        {sector: 'standard', increment: 10, expected: 1},
        {sector: 'standard', increment: 100, expected: 2},
        {sector: 'standard', increment: 1000, expected: 11},
        // Standing
        {sector: 'standing', increment: -100, expected: 2},
        {sector: 'standing', increment: -1, expected: 1},
        {sector: 'standing', increment: 0, expected: 0},
        {sector: 'standing', increment: 1, expected: 1},
        {sector: 'standing', increment: 10, expected: 1},
        {sector: 'standing', increment: 100, expected: 2},
        {sector: 'standing', increment: 1000, expected: 6},
      ])('returns correct total build time for +$increment $sector seat(s)', ({sector, increment, expected}) => {
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats[sector as keyof SeatsLayout] += increment;
        manager.setPlannedLayout(plannedSeats);

        const result = manager.getTotalTimeToBuild()

        expect(result).toBe(expected);
      });

      it('returns correct total build time for mixed increments', () => {
        // VIP: 1000 (41), Covered: 100 (3), Standard: 10 (1), Standing: -1 (1)
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        plannedSeats.vip += 1000;      // expected 41
        plannedSeats.covered += 100;   // expected 3
        plannedSeats.standard += 10;   // expected 1
        plannedSeats.standing += -1;   // expected 1
        manager.setPlannedLayout(plannedSeats);
        expect(manager.getTotalTimeToBuild()).toBe(41);
      });

      it('returns 0 when all increments are zero', () => {
        plannedSeats = { standing: 11040, standard: 5520, covered: 2760, vip: 690 };
        manager.setPlannedLayout(plannedSeats);
        expect(manager.getTotalTimeToBuild()).toBe(0);
      });
    });

  });
});