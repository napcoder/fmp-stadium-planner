import { Stadium, SeatsLayout } from "../src/stadium";
import { planner } from "../src/planner";

describe("planner", () => {
    describe("1-4-8-16 proportions", () => {
        it("calculates correct distribution for 2900 seats", () => {
            const currentStadium = new Stadium({ standing: 100, standard: 100, covered: 100, vip: 100 });
            const result = planner(2900, currentStadium);
            expect(result).not.toBeNull();
            expect(result?.getLayout()).toEqual({ standing: 1600, standard: 800, covered: 400, vip: 100 });
            expect(result?.getTotalSeats()).toBe(2900);
        });

        it("keeps the stadium if already sufficient", () => {
            const currentStadium = new Stadium({ standing: 10, standard: 10, covered: 10, vip: 10 });
            const result = planner(20, currentStadium);
            expect(result).toBe(currentStadium);
        });

        it("rounds correctly for numbers not multiple of 29", () => {
            const currentStadium = new Stadium({ standing: 0, standard: 0, covered: 0, vip: 0 });
            const result = planner(31, currentStadium);
            expect(result).not.toBeNull();
            expect(result?.getTotalSeats()).toBe(31);
            // The new logic distributes extra seats after reaching the ideal
            const layout = result!.getLayout();
            expect(layout.vip).toBeGreaterThanOrEqual(1);
            expect(layout.covered).toBeGreaterThanOrEqual(4);
            expect(layout.standard).toBeGreaterThanOrEqual(8);
            expect(layout.standing).toBeGreaterThanOrEqual(16);
        });

        it("add missing vip seats when current is above ideal for other types", () => {
            const currentStadium = new Stadium({ standing: 1600, standard: 800, covered: 400, vip: 0 });
            const result = planner(2900, currentStadium);
            expect(result).not.toBeNull();
            expect(result?.getLayout()).toEqual({ standing: 1600, standard: 800, covered: 400, vip: 100 });
            expect(result?.getTotalSeats()).toBe(2900);
        });
        it("add missing covered seats when current is above ideal for other types", () => {
            const currentStadium = new Stadium({ standing: 1600, standard: 800, covered: 0, vip: 100 });
            const result = planner(2900, currentStadium);
            expect(result).not.toBeNull();
            expect(result?.getLayout()).toEqual({ standing: 1600, standard: 800, covered: 400, vip: 100 });
            expect(result?.getTotalSeats()).toBe(2900);
        });
        it("add missing standard seats when current is above ideal for other types", () => {
            const currentStadium = new Stadium({ standing: 1600, standard: 0, covered: 400, vip: 100 });
            const result = planner(2900, currentStadium);
            expect(result).not.toBeNull();
            expect(result?.getLayout()).toEqual({ standing: 1600, standard: 800, covered: 400, vip: 100 });
            expect(result?.getTotalSeats()).toBe(2900);
        });
        it("add missing standing seats when current is above ideal for other types", () => {
            const currentStadium = new Stadium({ standing: 0, standard: 800, covered: 400, vip: 100 });
            const result = planner(2900, currentStadium);
            expect(result).not.toBeNull();
            expect(result?.getLayout()).toEqual({ standing: 1600, standard: 800, covered: 400, vip: 100 });
            expect(result?.getTotalSeats()).toBe(2900);
        });
    });

    describe("never decreases and edge cases", () => {
        it("never decreases any seat type", () => {
            const current: SeatsLayout = { standing: 10, standard: 20, covered: 30, vip: 40 };
            const result = planner(200, new Stadium(current));
            expect(result).not.toBeNull();
            const layout = result!.getLayout();
            expect(layout.standing).toBeGreaterThanOrEqual(10);
            expect(layout.standard).toBeGreaterThanOrEqual(20);
            expect(layout.covered).toBeGreaterThanOrEqual(30);
            expect(layout.vip).toBeGreaterThanOrEqual(40);
            expect(result!.getTotalSeats()).toBe(200);
        });

        it("keeps current stadium if already sufficient", () => {
            const current: SeatsLayout = { standing: 10, standard: 10, covered: 10, vip: 10 };
            const stadium = new Stadium(current);
            const result = planner(20, stadium);
            expect(result).toBe(stadium);
        });

        it("approaches the 1-4-8-16 proportion as much as possible", () => {
            const current: SeatsLayout = { standing: 0, standard: 0, covered: 0, vip: 0 };
            const result = planner(29, new Stadium(current));
            expect(result).not.toBeNull();
            const layout = result!.getLayout();
            expect(layout.vip).toBe(1);
            expect(layout.covered).toBe(4);
            expect(layout.standard).toBe(8);
            expect(layout.standing).toBe(16);
            expect(result!.getTotalSeats()).toBe(29);
        });

        it("never reduces below current even if current is above ideal", () => {
            const current: SeatsLayout = { standing: 100, standard: 100, covered: 100, vip: 100 };
            const result = planner(500, new Stadium(current));
            const layout = result!.getLayout();
            expect(layout.standing).toBeGreaterThanOrEqual(100);
            expect(layout.standard).toBeGreaterThanOrEqual(100);
            expect(layout.covered).toBeGreaterThanOrEqual(100);
            expect(layout.vip).toBeGreaterThanOrEqual(100);
            expect(result!.getTotalSeats()).toBe(500);
        });
    });
});
