import { SeatsRatio } from "./seats-ratio";
import { Stadium, SeatsLayout } from "./stadium";


const defaultRatio: SeatsRatio = SeatsRatio.getDefaultRatio();

export function planner(desiredTotal: number, currentStadium: Stadium, desiredRatio: SeatsRatio = defaultRatio): Stadium {
    const currentTotal = currentStadium.getTotalSeats();
    if (currentTotal >= desiredTotal) {
        return currentStadium; // No changes needed
    }

    // Desired proportion: vip:covered:standard:standing = e.g. default ratio 1:4:8:16
    // Total weight = 1+4+8+16 = 29
    const totalWeight = desiredRatio.getTotalWeight();

    // Get current layout
    const layout = currentStadium.getLayout();

    let remaining = desiredTotal - currentTotal;

    // Calculate the ideal seat counts for each type
    const idealLayout: SeatsLayout = {
        vip: desiredTotal * desiredRatio.vip / totalWeight,
        covered: desiredTotal * desiredRatio.covered / totalWeight,
        standard: desiredTotal * desiredRatio.standard / totalWeight,
        standing: desiredTotal * desiredRatio.standing / totalWeight
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
            remaining,
            desiredRatio,
        );
    } else {
        let extra = remaining - totalAdded;
        return distributeWithExtra(
            layout,
            addLayout,
            extra,
            desiredRatio,
        );
    }
}

/**
 * Distributes remaining seats to approach the ideal 1-4-8-16 proportion, never decreasing any type.
 * Uses a greedy algorithm to increment the type with the largest gap to its ideal until all seats are assigned.
 * @param layout The current seat layout (SeatsLayout)
 * @param idealLayout The ideal seat layout (SeatsLayout)
 * @param remaining Number of seats left to assign
 * @param desiredRatio The desired seats ratio (SeatsRatio)
 * @returns A new Stadium instance with the updated seat distribution
 */
function distributeGreedy(
    layout: SeatsLayout,
    idealLayout: SeatsLayout,
    remaining: number,
    desiredRatio: SeatsRatio
): Stadium {
    let needs = [
        { type: 'vip', current: layout.vip, ideal: idealLayout.vip, weight:  desiredRatio.vip },
        { type: 'covered', current: layout.covered, ideal: idealLayout.covered, weight:  desiredRatio.covered },
        { type: 'standard', current: layout.standard, ideal: idealLayout.standard, weight:  desiredRatio.standard },
        { type: 'standing', current: layout.standing, ideal: idealLayout.standing, weight:  desiredRatio.standing },
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
 * @param desiredRatio The desired seats ratio (SeatsRatio)
 * @returns A new Stadium instance with the updated seat distribution
 */
function distributeWithExtra(
    layout: SeatsLayout,
    addLayout: SeatsLayout,
    extra: number,
    desiredRatio: SeatsRatio
): Stadium {
    let vip = layout.vip + addLayout.vip;
    let covered = layout.covered + addLayout.covered;
    let standard = layout.standard + addLayout.standard;
    let standing = layout.standing + addLayout.standing;
    const weights = [
        { type: 'vip', weight: desiredRatio.vip },
        { type: 'covered', weight: desiredRatio.covered },
        { type: 'standard', weight: desiredRatio.standard },
        { type: 'standing', weight: desiredRatio.standing },
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
