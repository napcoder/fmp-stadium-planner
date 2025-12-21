// ==UserScript==
// @name         FMP Stadium Planner
// @namespace    https://github.com/napcoder/fmp-stadium-planner
// @version      0.1.0
// @description  Plan, analyze and optimize your Football Manager Project (FMP) stadium!
// @author       Marco Travaglini (Napcoder)
// @match        https://footballmanagerproject.com/Economy/Stadium
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// @license      MIT
// @updateURL    https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.js
// @downloadURL  https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.js
// @homepageURL  https://github.com/napcoder/fmp-stadium-planner
// @supportURL   https://github.com/napcoder/fmp-stadium-planner/issues
// ==/UserScript==

(function () {
    'use strict';

    class Stadium {
        standing;
        standard;
        covered;
        vip;
        static standingMultiplier = 1;
        static standardMultiplier = 2;
        static coveredMultiplier = 4;
        static vipMultiplier = 12;
        constructor(standing, standard, covered, vip) {
            this.standing = standing;
            this.standard = standard;
            this.covered = covered;
            this.vip = vip;
        }
        calcMaxIncome(baseTicket) {
            return baseTicket * ((this.standing * Stadium.standingMultiplier) +
                (this.standard * Stadium.standardMultiplier) +
                (this.covered * Stadium.coveredMultiplier) +
                (this.vip * Stadium.vipMultiplier));
        }
    }

    async function getStadiumData() {
        try {
            const response = await fetch('/Economy/Stadium?handler=StadiumData');
            if (!response.ok)
                throw new Error('Network response was not ok');
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('Error fetching stadium data:', error);
            return undefined;
        }
    }

    const translations = {
        en: {
            maxIncome: "Maximum income:"
        },
        it: {
            maxIncome: "Massimo incasso:"
        }
    };
    function getUserLang() {
        const lang = navigator.language || navigator.languages[0] || 'en';
        return lang.startsWith('it') ? 'it' : 'en';
    }
    const supportedLangs = ['en', 'it'];
    function getTranslator(lang) {
        let userLang = getUserLang();
        if (!supportedLangs.includes(userLang)) {
            userLang = 'en';
        }
        return function t(key) {
            return translations[userLang][key] || translations['en'][key] || key;
        };
    }

    (function () {
        const t = getTranslator();
        async function run() {
            const stadiumData = await getStadiumData();
            let stadium;
            let maxIncome;
            if (stadiumData && stadiumData.stadium && stadiumData.stadium.stands) {
                stadium = new Stadium(stadiumData.stadium.stands.sta, stadiumData.stadium.stands.std, stadiumData.stadium.stands.cov, stadiumData.stadium.stands.vip);
                maxIncome = stadium.calcMaxIncome(28);
            }
            else {
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
        function htmlBuilder(maxIncome) {
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
        function findInjectionPoint() {
            // Find the first element with all three classes: d-flex flex-row flex-wrap
            const candidates = document.querySelectorAll('div.d-flex.flex-row.flex-wrap');
            return candidates.length > 0 ? candidates[0] : null;
        }
        if (window.location.pathname.endsWith('Economy/Stadium')) {
            run();
        }
    })();

})();
