import { Stadium } from "./stadium";
import { getStadiumData } from './stadium-api';
import Store from './store';
import { buildView } from './view/index';
import { SeasonTickets } from './season-tickets';

(function() {
    'use strict';

    async function run() {
        const stadiumData = await getStadiumData();
        let stadium: Stadium;
        let baseTicketPrice: number;
        let seasonTickets: SeasonTickets
        if (stadiumData && stadiumData.stadium && stadiumData.stadium.stands) {
            stadium = new Stadium({
                standing: stadiumData.stadium.stands.sta,
                standard: stadiumData.stadium.stands.std,
                covered: stadiumData.stadium.stands.cov,
                vip: stadiumData.stadium.stands.vip,
            });
            baseTicketPrice = stadiumData.standingPlacePrice;
            seasonTickets = new SeasonTickets(
                stadiumData.stadium.seasTkts.sta,
                stadiumData.stadium.seasTkts.std,
                stadiumData.stadium.seasTkts.cov,
                stadiumData.stadium.seasTkts.vip,
                stadiumData.stadium.seasTkts.tot,
            );
        } else {
            console.error('FMP Stadium Planner: Unable to retrieve stadium data from page.');
            return;
        }

        // Initialize store with current stadium
        const store = new Store({
            currentStadium: stadium,
            plannedStadium: stadium.clone(),
            baseTicketPrice: baseTicketPrice,
            seasonTickets: seasonTickets,
        });

        buildView(store);
    }

    if (window.location.pathname.endsWith('Economy/Stadium')) {
        run();
    }

})();
