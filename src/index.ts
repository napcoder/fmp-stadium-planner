import { UpgradeManager } from "./upgrade-manager";
import { Stadium } from "./stadium";
import { getStadiumData } from './stadium-api';
import Store from './store';
import { buildView } from './view/index';

(function() {
    'use strict';

    async function run() {
        const stadiumData = await getStadiumData();
        let stadium: Stadium;
        let baseTicketPrice: number;
        if (stadiumData && stadiumData.stadium && stadiumData.stadium.stands) {
            stadium = new Stadium({
                standing: stadiumData.stadium.stands.sta,
                standard: stadiumData.stadium.stands.std,
                covered: stadiumData.stadium.stands.cov,
                vip: stadiumData.stadium.stands.vip,
            });
            baseTicketPrice = stadiumData.standingPlacePrice;
        } else {
            // TODO: remove this fallback and show an error message to the user
            stadium = new Stadium({ standing: 4000, standard: 2000, covered: 1000, vip: 0 });
            baseTicketPrice = 28;
        }

        // Initialize store with current stadium
        const store = new Store({
            currentStadium: stadium,
            plannedStadium: stadium.clone(),
            baseTicketPrice: baseTicketPrice,
        });

        buildView(store);
    }

    if (window.location.pathname.endsWith('Economy/Stadium')) {
        run();
    }

})();
