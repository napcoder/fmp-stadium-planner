export class SeasonTickets {
    standing: number
    standard: number
    covered: number
    vip: number
    tot: number
    constructor(standing: number, standard: number, covered: number, vip: number, total: number) {
        this.standing = standing
        this.standard = standard
        this.covered = covered
        this.vip = vip
        this.tot = total
    }
    isDifferent(other: SeasonTickets): boolean {
        return this.standing !== other.standing ||
               this.standard !== other.standard ||
               this.covered !== other.covered ||
               this.vip !== other.vip ||
               this.tot !== other.tot
    }
}