export interface SeatsLayout {
    standing: number;
    standard: number;
    covered: number;
    vip: number;
}

export class Stadium {
    standing: number;
    standard: number;
    covered: number;
    vip: number;
    static standingMultiplier = 1;
    static standardMultiplier = 2;
    static coveredMultiplier = 4;
    static vipMultiplier = 12;
    constructor(layout: SeatsLayout) {
        this.standing = layout.standing;
        this.standard = layout.standard;
        this.covered = layout.covered;
        this.vip = layout.vip;
    }
    calcMaxIncome(baseTicket: number): number {
        return baseTicket * (
            (this.standing * Stadium.standingMultiplier) +
            (this.standard * Stadium.standardMultiplier) +
            (this.covered * Stadium.coveredMultiplier) +
            (this.vip * Stadium.vipMultiplier)
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
}
