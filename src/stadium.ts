export class Stadium {
    standing: number;
    standard: number;
    covered: number;
    vip: number;
    static standingMultiplier = 1;
    static standardMultiplier = 2;
    static coveredMultiplier = 4;
    static vipMultiplier = 12;
    constructor(standing: number, standard: number, covered: number, vip: number) {
        this.standing = standing;
        this.standard = standard;
        this.covered = covered;
        this.vip = vip;
    }
    calcMaxIncome(baseTicket: number): number {
        return baseTicket * (
            (this.standing * Stadium.standingMultiplier) +
            (this.standard * Stadium.standardMultiplier) +
            (this.covered * Stadium.coveredMultiplier) +
            (this.vip * Stadium.vipMultiplier)
        );
    }
}
