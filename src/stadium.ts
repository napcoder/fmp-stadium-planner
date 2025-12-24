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
    calcMaxIncome(baseTicketPrice: number): number {
        return baseTicketPrice * (
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
    isDifferentLayout(other: Stadium): boolean {
        return this.standing !== other.standing ||
               this.standard !== other.standard ||
               this.covered !== other.covered ||
               this.vip !== other.vip;
    }
}

export class EnhancedStadium extends Stadium {
    baseTicketPrice: number;
    constructor(layout: SeatsLayout, baseTicketPrice: number) {
        super(layout);
        this.baseTicketPrice = baseTicketPrice;
    }
    static fromStadium(stadium: Stadium, baseTicketPrice: number): EnhancedStadium {
        return new EnhancedStadium(stadium.getLayout(), baseTicketPrice);
    }
    calcMaxIncome(): number {
        return super.calcMaxIncome(this.baseTicketPrice);
    }
    clone(): EnhancedStadium {
        return new EnhancedStadium(this.getLayout(), this.baseTicketPrice);
    }
}
