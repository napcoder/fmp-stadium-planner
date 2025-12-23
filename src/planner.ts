import { Stadium, SeatsLayout } from "./stadium";


/**
 * Distributes remaining seats to approach the ideal 1-4-8-16 proportion, never decreasing any type.
 * Uses a greedy algorithm to increment the type with the largest gap to its ideal until all seats are assigned.
 * @param layout The current seat layout (SeatsLayout)
 * @param idealLayout The ideal seat layout (SeatsLayout)
 * @param remaining Number of seats left to assign
 * @returns A new Stadium instance with the updated seat distribution
 */
function distributeGreedy(
    layout: SeatsLayout,
    idealLayout: SeatsLayout,
    remaining: number
): Stadium {
    let needs = [
        { type: 'vip', current: layout.vip, ideal: idealLayout.vip, weight: 1 },
        { type: 'covered', current: layout.covered, ideal: idealLayout.covered, weight: 4 },
        { type: 'standard', current: layout.standard, ideal: idealLayout.standard, weight: 8 },
        { type: 'standing', current: layout.standing, ideal: idealLayout.standing, weight: 16 },
    ];
    while (remaining > 0) {
        needs.sort((a, b) => (b.ideal - b.current) - (a.ideal - a.current));
        for (let i = 0; i < needs.length; i++) {
            if (needs[i].current < needs[i].ideal) {
                needs[i].current++;
                remaining--;
                break;
            }
        }
        if (needs.every(n => n.current >= n.ideal)) {
            needs.find(n => n.type === 'standing')!.current++;
            remaining--;
        }
    }
    return new Stadium({
        standing: needs.find(n => n.type === 'standing')!.current,
        standard: needs.find(n => n.type === 'standard')!.current,
        covered: needs.find(n => n.type === 'covered')!.current,
        vip: needs.find(n => n.type === 'vip')!.current
    });
}


/**
 * Adds the minimum needed to reach the ideal for each type, then distributes any extra seats in 1-4-8-16 order.
 * Never decreases any seat type below the current value.
 * @param layout The current seat layout (SeatsLayout)
 * @param addLayout Object with seats to add for each type (SeatsLayout)
 * @param extra Remaining seats to distribute after reaching all ideals
 * @returns A new Stadium instance with the updated seat distribution
 */
function distributeWithExtra(
    layout: SeatsLayout,
    addLayout: SeatsLayout,
    extra: number
): Stadium {
    let vip = layout.vip + addLayout.vip;
    let covered = layout.covered + addLayout.covered;
    let standard = layout.standard + addLayout.standard;
    let standing = layout.standing + addLayout.standing;
    const weights = [
        { type: 'vip', weight: 1 },
        { type: 'covered', weight: 4 },
        { type: 'standard', weight: 8 },
        { type: 'standing', weight: 16 },
    ];
    while (extra > 0) {
        for (const w of weights) {
            if (extra === 0) break;
            switch (w.type) {
                case 'vip': vip++; break;
                case 'covered': covered++; break;
                case 'standard': standard++; break;
                case 'standing': standing++; break;
            }
            extra--;
        }
    }
    return new Stadium({ standing, standard, covered, vip });
}

export function planner(desiredTotal: number, currentStadium: Stadium): Stadium | null {
    const currentTotal = currentStadium.getTotalSeats();
    if (currentTotal >= desiredTotal) {
        return currentStadium; // No changes needed
    }

    // Desired proportion: vip:covered:standard:standing = 1:4:8:16
    // Total weight = 1+4+8+16 = 29
    const totalWeight = 29;

    // Get current layout
    const layout = currentStadium.getLayout();

    let remaining = desiredTotal - currentTotal;

    // Calculate the ideal seat counts for each type
    const idealLayout: SeatsLayout = {
        vip: desiredTotal * 1 / totalWeight,
        covered: desiredTotal * 4 / totalWeight,
        standard: desiredTotal * 8 / totalWeight,
        standing: desiredTotal * 16 / totalWeight
    };

    // Calculate how many more seats are needed for each type to reach the ideal
    const addLayout: SeatsLayout = {
        vip: Math.max(0, Math.ceil(idealLayout.vip - layout.vip)),
        covered: Math.max(0, Math.ceil(idealLayout.covered - layout.covered)),
        standard: Math.max(0, Math.ceil(idealLayout.standard - layout.standard)),
        standing: Math.max(0, Math.ceil(idealLayout.standing - layout.standing)),
    };

    let totalAdded = addLayout.vip + addLayout.covered + addLayout.standard + addLayout.standing;
    if (totalAdded > remaining) {
        return distributeGreedy(
            layout,
            idealLayout,
            remaining
        );
    } else {
        let extra = remaining - totalAdded;
        return distributeWithExtra(
            layout,
            addLayout,
            extra
        );
    }
}