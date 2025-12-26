import { Stadium, SeatsLayout } from "./stadium";

export class UpgradeManager {
    currentStadium: Stadium;
    plannedStadium: Stadium;
    baseTicketPrice: number;

    constructor(currentLayout: SeatsLayout, baseTicketPrice: number, plannedLayout?: SeatsLayout) {
        this.currentStadium = new Stadium(currentLayout);
        this.plannedStadium = new Stadium(plannedLayout || currentLayout);
        this.baseTicketPrice = baseTicketPrice;
    }

    static fromStadium(currentStadium: Stadium, baseTicketPrice: number): UpgradeManager {
        return new UpgradeManager(currentStadium.getLayout(), baseTicketPrice);
    }

    setPlannedLayout(layout: SeatsLayout) {
        this.plannedStadium = new Stadium(layout);
    }

    private calcSectorBuildingCost(newseats: number, oldseats: number, maintainCostFactor: number): number {
        if (newseats < oldseats)
            return 0;
        return Math.ceil(0.15 * (Math.pow(newseats * maintainCostFactor, 2.0) 
            - Math.pow(oldseats * maintainCostFactor, 2.0)) * 4.5 / 32400) * 2500;
    }

    public TimeToBuild(newseats: number, oldseats: number, buildTimeFact: number): number {
        return Math.round((1.0 + buildTimeFact * Math.abs(newseats - oldseats)/1000.0));
    }

    getVipBuildingCost(): number {
        return this.calcSectorBuildingCost(
            this.plannedStadium.vip,
            this.currentStadium.vip,
            Stadium.config.vip.buildTimeFactor
        );
    }

    getCoveredBuildingCost(): number {
        return this.calcSectorBuildingCost(
            this.plannedStadium.covered,
            this.currentStadium.covered,
            Stadium.config.covered.buildTimeFactor
        );
    }

    getStandardBuildingCost(): number {
        return this.calcSectorBuildingCost(
            this.plannedStadium.standard,
            this.currentStadium.standard,
            Stadium.config.standard.buildTimeFactor
        );
    }

    getStandingBuildingCost(): number {
        return this.calcSectorBuildingCost(
            this.plannedStadium.standing,
            this.currentStadium.standing,
            Stadium.config.standing.buildTimeFactor
        );
    }

    getTotalBuildingCost(): number {
        return this.getVipBuildingCost() +
               this.getCoveredBuildingCost() +
               this.getStandardBuildingCost() +
               this.getStandingBuildingCost();
    }

    getVipTimeToBuild(): number {
        return this.TimeToBuild(
            this.plannedStadium.vip,
            this.currentStadium.vip,
            Stadium.config.vip.buildTimeFactor
        );
    }

    getCoveredTimeToBuild(): number {
        return this.TimeToBuild(
            this.plannedStadium.covered,
            this.currentStadium.covered,
            Stadium.config.covered.buildTimeFactor
        );
    }

    getStandardTimeToBuild(): number {
        return this.TimeToBuild(
            this.plannedStadium.standard,
            this.currentStadium.standard,
            Stadium.config.standard.buildTimeFactor
        );
    }

    getStandingTimeToBuild(): number {
        return this.TimeToBuild(
            this.plannedStadium.standing,
            this.currentStadium.standing,
            Stadium.config.standing.buildTimeFactor
        );
    }

    getTotalTimeToBuild(): number {
        return Math.max(
            this.getVipTimeToBuild(),
            this.getCoveredTimeToBuild(),
            this.getStandardTimeToBuild(),
            this.getStandingTimeToBuild()
        );
    }
}
