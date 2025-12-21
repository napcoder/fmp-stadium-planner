import { Stadium } from './stadium';
import { StadiumData, getStadiumData } from './stadium-api';
import { getTranslator } from './i18n';

(function() {
    'use strict';

    const t = getTranslator();


    async function run() {
        const stadiumData = await getStadiumData();
        let stadium: Stadium;
        let maxIncome: number;
        if (stadiumData && stadiumData.stadium && stadiumData.stadium.stands) {
            stadium = new Stadium(
                stadiumData.stadium.stands.sta,
                stadiumData.stadium.stands.std,
                stadiumData.stadium.stands.cov,
                stadiumData.stadium.stands.vip
            );
            maxIncome = stadium.calcMaxIncome(28);
        } else {
            // fallback to hardcoded values
            stadium = new Stadium(11040, 5520, 2760, 690);
            maxIncome = stadium.calcMaxIncome(28);
        }

        const injectionPoint = findInjectionPoint();
        if (injectionPoint) {
            const container = htmlBuilder(maxIncome);
            injectionPoint.appendChild(container);
        }
    }


    function htmlBuilder(maxIncome: number) {
        // Build the structure as per the provided HTML
        const container = document.createElement('div');
        container.id = 'fmp-stadium-planner';
        container.className = 'fmpx board flexbox box';
        container.style.flexGrow = '1';
        container.style.flexBasis = '400px';
        // container.style.margin = '24px 0';

        // Title section
        const title = document.createElement('div');
        title.className = 'title';

        const main = document.createElement('div');
        main.className = 'main';
        main.textContent = 'FMP Stadium Planner';
        title.appendChild(main);

        const section = document.createElement('div');
        section.className = 'section';
        section.textContent = 'Information';
        title.appendChild(section);

        container.appendChild(title);

        // Economy item
        const item = document.createElement('div');
        item.className = 'item economy';
        const info = document.createElement('div');
        info.textContent = `${t('maxIncome')} ${maxIncome.toLocaleString()}ⓕ`;
        item.appendChild(info);
        container.appendChild(item);

        return container;
    }

    function findInjectionPoint(): HTMLElement | null {
        // Find the first element with all three classes: d-flex flex-row flex-wrap
        const candidates = document.querySelectorAll('div.d-flex.flex-row.flex-wrap');
        return candidates.length > 0 ? (candidates[0] as HTMLElement) : null;
    }

    if (window.location.pathname.endsWith('Economy/Stadium')) {
        run();
    }

})();
