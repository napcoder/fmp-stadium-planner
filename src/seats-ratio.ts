export class SeatsRatio {
    vip: number;
    covered: number;
    standard: number;
    standing: number;
    constructor({vip, covered, standard, standing}: {vip: number, covered: number, standard: number, standing: number}) {
        this.vip = vip;
        this.covered = covered;
        this.standard = standard;
        this.standing = standing;
    }

    getTotalWeight(): number {
        return this.vip + this.covered + this.standard + this.standing;
    }

    toString(): string {
        return `${this.vip}-${this.covered}-${this.standard}-${this.standing}`;
    }
}