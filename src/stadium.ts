import { SeasonTickets } from "./season-tickets";
import { SeatsRatio } from "./seats-ratio";

export interface SeatsLayout {
    standing: number;
    standard: number;
    covered: number;
    vip: number;
}

interface StadiumConfig {
    vip: SeatConfig;
    covered: SeatConfig;
    standard: SeatConfig;
    standing: SeatConfig;
}

interface SeatConfig {
    ticketMultiplier: number;
    maintainCostFactor: number;
    buildTimeFactor: number;
}

export class Stadium {
    standing: number;
    standard: number;
    covered: number;
    vip: number;

    static config: StadiumConfig = {
        vip: { 
            ticketMultiplier: 12, 
            maintainCostFactor: 12, 
            buildTimeFactor: 40,
        },
        covered: { 
            ticketMultiplier: 4, 
            maintainCostFactor: 4, 
            buildTimeFactor: 20,
        },
        standard: { 
            ticketMultiplier: 2, 
            maintainCostFactor: 2, 
            buildTimeFactor: 10,    
        },
        standing: { 
            ticketMultiplier: 1, 
            maintainCostFactor: 1, 
            buildTimeFactor: 5,
        }
    }

    constructor(layout: SeatsLayout) {
        this.standing = layout.standing;
        this.standard = layout.standard;
        this.covered = layout.covered;
        this.vip = layout.vip;
    }

    calcMaxIncome(baseTicketPrice: number): number {
        return baseTicketPrice * (
            (this.standing * Stadium.config.standing.ticketMultiplier) +
            (this.standard * Stadium.config.standard.ticketMultiplier) +
            (this.covered * Stadium.config.covered.ticketMultiplier) +
            (this.vip * Stadium.config.vip.ticketMultiplier)
        );
    }

    calcMaxIncomeWithoutSeasonTickets(baseTicketPrice: number, seasonTickets: SeasonTickets): number {
        return baseTicketPrice * (
            ((this.standing - seasonTickets.standing) * Stadium.config.standing.ticketMultiplier) +
            ((this.standard - seasonTickets.standard) * Stadium.config.standard.ticketMultiplier) +
            ((this.covered - seasonTickets.covered) * Stadium.config.covered.ticketMultiplier) +
            ((this.vip - seasonTickets.vip) * Stadium.config.vip.ticketMultiplier)
        );
    }

    getTotalSeats(): number {
        return this.standing + this.standard + this.covered + this.vip;
    }

    getLayout(): SeatsLayout {
        return {
            standing: this.standing,
            standard: this.standard,
            covered: this.covered,
            vip: this.vip
        };
    }

    isDifferentLayout(other: Stadium): boolean {
        return this.standing !== other.standing ||
               this.standard !== other.standard ||
               this.covered !== other.covered ||
               this.vip !== other.vip;
    }

    private calcMaintainCost(seats: number, maintainCostFactor: number): number {
        return Math.ceil(0.01 * Math.pow(seats * maintainCostFactor, 2.0) * 4.5 / 32400) * 100;
    }

    getMaintainCost(): number {
        return this.calcMaintainCost(this.standing, Stadium.config.standing.maintainCostFactor) +
               this.calcMaintainCost(this.standard, Stadium.config.standard.maintainCostFactor) +
               this.calcMaintainCost(this.covered, Stadium.config.covered.maintainCostFactor) +
               this.calcMaintainCost(this.vip, Stadium.config.vip.maintainCostFactor);
    }

    clone(): Stadium {
        return new Stadium(this.getLayout());
    }

    getRatio(): SeatsRatio {
        const totalSeats = this.getTotalSeats();
        if (totalSeats === 0) {
            return new SeatsRatio({
                vip: 0,
                covered: 0,
                standard: 0,
                standing: 0
            });
        }
        // find the lower non zero number in seats and use it to calculate ratio
        const nonZeroSeats = [this.standing, this.standard, this.covered, this.vip].filter(seat => seat > 0);
        const minNonZeroSeat = nonZeroSeats.length > 0 ? Math.min(...nonZeroSeats) : 1;
        return new SeatsRatio({
            vip: Math.round(this.vip / minNonZeroSeat),
            covered: Math.round(this.covered / minNonZeroSeat),
            standard: Math.round(this.standard / minNonZeroSeat),
            standing: Math.round(this.standing / minNonZeroSeat)
        });
    }
}


