import { EnhancedStadium } from './stadium';
import { getStadiumData } from './stadium-api';
import Store from './store';
import { buildView } from './view/index';

(function() {
    'use strict';

    async function run() {
        const stadiumData = await getStadiumData();
        let stadium: EnhancedStadium;
        let maxIncome: number;
        if (stadiumData && stadiumData.stadium && stadiumData.stadium.stands) {
            stadium = new EnhancedStadium({
                standing: stadiumData.stadium.stands.sta,
                standard: stadiumData.stadium.stands.std,
                covered: stadiumData.stadium.stands.cov,
                vip: stadiumData.stadium.stands.vip,
            }, stadiumData.standingPlacePrice);
            maxIncome = stadium.calcMaxIncome();
        } else {
            // TODO: remove this fallback and show an error message to the user
            stadium = new EnhancedStadium({ standing: 11040, standard: 5520, covered: 2760, vip: 690 }, 28);
            maxIncome = stadium.calcMaxIncome();
        }

        // Initialize store with current stadium and max income
        const store = new Store({
            currentStadium: stadium,
            plannedStadium: stadium.clone(),
        });

        // Pass the current stadium and the base ticket price (28)
        buildView(store);
    }

    if (window.location.pathname.endsWith('Economy/Stadium')) {
        run();
    }

})();
