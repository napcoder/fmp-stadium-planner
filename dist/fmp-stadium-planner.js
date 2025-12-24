// ==UserScript==
// @name         FMP Stadium Planner
// @namespace    https://github.com/napcoder/fmp-stadium-planner
// @version      0.2.0
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
        constructor(layout) {
            this.standing = layout.standing;
            this.standard = layout.standard;
            this.covered = layout.covered;
            this.vip = layout.vip;
        }
        calcMaxIncome(baseTicketPrice) {
            return baseTicketPrice * ((this.standing * Stadium.standingMultiplier) +
                (this.standard * Stadium.standardMultiplier) +
                (this.covered * Stadium.coveredMultiplier) +
                (this.vip * Stadium.vipMultiplier));
        }
        getTotalSeats() {
            return this.standing + this.standard + this.covered + this.vip;
        }
        getLayout() {
            return {
                standing: this.standing,
                standard: this.standard,
                covered: this.covered,
                vip: this.vip
            };
        }
        isDifferentLayout(other) {
            return this.standing !== other.standing ||
                this.standard !== other.standard ||
                this.covered !== other.covered ||
                this.vip !== other.vip;
        }
    }
    class EnhancedStadium extends Stadium {
        baseTicketPrice;
        constructor(layout, baseTicketPrice) {
            super(layout);
            this.baseTicketPrice = baseTicketPrice;
        }
        static fromStadium(stadium, baseTicketPrice) {
            return new EnhancedStadium(stadium.getLayout(), baseTicketPrice);
        }
        calcMaxIncome() {
            return super.calcMaxIncome(this.baseTicketPrice);
        }
        clone() {
            return new EnhancedStadium(this.getLayout(), this.baseTicketPrice);
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

    class Store {
        state;
        listeners = [];
        constructor(initialState) {
            this.state = initialState;
        }
        getState() {
            return this.state;
        }
        setState(partial) {
            const prevState = this.state;
            const newState = { ...this.state, ...partial };
            if (!this.isChanged(newState, prevState)) {
                return; // No relevant changes
            }
            this.state = newState;
            this.notify(newState, prevState);
        }
        subscribe(listener) {
            this.listeners.push(listener);
            // Call immediately with current state
            listener(this.state, this.state);
            return () => {
                this.listeners = this.listeners.filter(l => l !== listener);
            };
        }
        isChanged(newState, prevState) {
            return (newState.currentStadium !== prevState.currentStadium && prevState.currentStadium.isDifferentLayout(newState.currentStadium)) ||
                (newState.plannedStadium !== prevState.plannedStadium && (newState.plannedStadium === null || prevState.plannedStadium === null || prevState.plannedStadium.isDifferentLayout(newState.plannedStadium)));
        }
        notify(newState, prevState) {
            for (const l of this.listeners)
                l(newState, prevState);
        }
    }

    const translations = {
        en: {
            maxIncomeCurrent: "Maximum income (current)",
            maxIncomePlanned: "Maximum income (planned)",
            plan: "Plan",
            planner: "Planner",
            desiredTotalSeats: "Desired total seats",
        },
        it: {
            maxIncomeCurrent: "Massimo incasso (attuale)",
            maxIncomePlanned: "Massimo incasso (pianificato)",
            plan: "Pianifica",
            planner: "Planner",
            desiredTotalSeats: "Posti totali desiderati",
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
    // Helper to retrieve host-provided translation object `window.trxt` when available
    function getHostTrxt() {
        try {
            // Prefer host globals exposed on window in browser, but also
            // support test environments where globals are on globalThis.
            const host = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : undefined);
            if (host && host.trxt)
                return host.trxt;
        }
        catch (e) {
            // ignore
        }
        return null;
    }
    // Try to retrieve a label from the host-provided `trxt` object.
    // `label` is the key to look up; `label` is returned when not found.
    function getHostLabel(label) {
        const trxt = getHostTrxt();
        if (!trxt)
            return label;
        try {
            return trxt[label] || label;
        }
        catch (e) {
            // ignore errors and fall through to fallback
        }
        return label;
    }

    function makeTitleContainer(mainTitle, subTitle, showBorder = true) {
        const title = document.createElement('div');
        title.className = 'title';
        if (showBorder === false) {
            title.style.border = 'none';
            title.style.margin = '0';
        }
        if (mainTitle) {
            const main = document.createElement('div');
            main.className = 'main';
            main.textContent = mainTitle;
            title.appendChild(main);
        }
        if (subTitle) {
            const section = document.createElement('div');
            section.className = 'section';
            section.textContent = subTitle;
            title.appendChild(section);
        }
        return title;
    }

    const t$1 = getTranslator();
    // Renders info-view and subscribes to store updates
    function renderInfoView(container, store) {
        // Clear container
        container.innerHTML = '';
        // Subscribe to store
        store.subscribe((state, prevState) => {
            container.innerHTML = '';
            const title = makeTitleContainer(null, getHostLabel('stadium.Information'));
            container.appendChild(title);
            const content = createItemContainer$1();
            // Current stadium info
            const currentInfo = document.createElement('div');
            currentInfo.id = 'fmp-stadium-current-info';
            const maxIncome = state.currentStadium.calcMaxIncome();
            currentInfo.innerHTML = `<p>${t$1('maxIncomeCurrent')}: ${maxIncome.toLocaleString()}ⓕ</p>`;
            content.appendChild(currentInfo);
            // Planned stadium info (if available)
            if (state.plannedStadium) {
                const plannedInfo = document.createElement('div');
                plannedInfo.id = 'fmp-stadium-planned-info';
                const plannedMaxIncome = state.plannedStadium.calcMaxIncome();
                plannedInfo.innerHTML = `<p>${t$1('maxIncomePlanned')}: ${plannedMaxIncome.toLocaleString()}ⓕ</p>`;
                content.appendChild(plannedInfo);
            }
            container.appendChild(content);
        });
    }
    function createItemContainer$1() {
        const item = document.createElement('div');
        item.className = 'item economy';
        return item;
    }

    /**
     * Distributes remaining seats to approach the ideal 1-4-8-16 proportion, never decreasing any type.
     * Uses a greedy algorithm to increment the type with the largest gap to its ideal until all seats are assigned.
     * @param layout The current seat layout (SeatsLayout)
     * @param idealLayout The ideal seat layout (SeatsLayout)
     * @param remaining Number of seats left to assign
     * @returns A new Stadium instance with the updated seat distribution
     */
    function distributeGreedy(layout, idealLayout, remaining) {
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
                needs.find(n => n.type === 'standing').current++;
                remaining--;
            }
        }
        return new Stadium({
            standing: needs.find(n => n.type === 'standing').current,
            standard: needs.find(n => n.type === 'standard').current,
            covered: needs.find(n => n.type === 'covered').current,
            vip: needs.find(n => n.type === 'vip').current
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
    function distributeWithExtra(layout, addLayout, extra) {
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
                if (extra === 0)
                    break;
                switch (w.type) {
                    case 'vip':
                        vip++;
                        break;
                    case 'covered':
                        covered++;
                        break;
                    case 'standard':
                        standard++;
                        break;
                    case 'standing':
                        standing++;
                        break;
                }
                extra--;
            }
        }
        return new Stadium({ standing, standard, covered, vip });
    }
    function planner(desiredTotal, currentStadium) {
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
        const idealLayout = {
            vip: desiredTotal * 1 / totalWeight,
            covered: desiredTotal * 4 / totalWeight,
            standard: desiredTotal * 8 / totalWeight,
            standing: desiredTotal * 16 / totalWeight
        };
        // Calculate how many more seats are needed for each type to reach the ideal
        const addLayout = {
            vip: Math.max(0, Math.ceil(idealLayout.vip - layout.vip)),
            covered: Math.max(0, Math.ceil(idealLayout.covered - layout.covered)),
            standard: Math.max(0, Math.ceil(idealLayout.standard - layout.standard)),
            standing: Math.max(0, Math.ceil(idealLayout.standing - layout.standing)),
        };
        let totalAdded = addLayout.vip + addLayout.covered + addLayout.standard + addLayout.standing;
        if (totalAdded > remaining) {
            return distributeGreedy(layout, idealLayout, remaining);
        }
        else {
            let extra = remaining - totalAdded;
            return distributeWithExtra(layout, addLayout, extra);
        }
    }

    const t = getTranslator();
    const MAX_SEATS = 1000000;
    // Renders planner-view and subscribes to store updates
    function renderPlannerView(container, store) {
        container.innerHTML = '';
        store.subscribe((state, prevState) => {
            container.innerHTML = '';
            const title = makeTitleContainer(null, t('planner'));
            container.appendChild(title);
            const itemContainer = createItemContainer();
            container.appendChild(itemContainer);
            const table = createTable(state.plannedStadium?.getLayout() || state.currentStadium.getLayout());
            itemContainer.appendChild(table);
            // Bootstrap layout: label above input, button right
            const controls = document.createElement('div');
            controls.id = 'planner-controls';
            controls.className = 'item economy';
            controls.style.marginTop = '12px';
            // Form group for label above input
            const formGroup = document.createElement('div');
            formGroup.className = 'mb-0';
            formGroup.style.display = 'flex';
            formGroup.style.flexDirection = 'column';
            formGroup.style.marginRight = '8px';
            const label = document.createElement('label');
            label.htmlFor = 'desiredTotalInput';
            label.textContent = t('desiredTotalSeats');
            label.className = 'form-label';
            const input = document.createElement('input');
            input.type = 'number';
            input.id = 'desiredTotalInput';
            input.min = state.currentStadium.getTotalSeats().toString();
            input.max = MAX_SEATS.toString();
            input.placeholder = state.plannedStadium?.getTotalSeats().toString() || state.currentStadium.getTotalSeats().toString();
            input.value = state.plannedStadium?.getTotalSeats().toString() || state.currentStadium.getTotalSeats().toString();
            input.className = 'form-control';
            input.style.width = '160px';
            formGroup.appendChild(label);
            formGroup.appendChild(input);
            // Button
            const btn = document.createElement('button');
            btn.id = 'planBtn';
            btn.className = 'fmp-btn btn-green btn ms-2';
            btn.textContent = t('plan');
            // Flex row: formGroup (label+input) + button
            const flexRow = document.createElement('div');
            flexRow.className = 'd-flex align-items-end';
            flexRow.appendChild(formGroup);
            flexRow.appendChild(btn);
            controls.appendChild(flexRow);
            container.appendChild(controls);
            btn.addEventListener('click', () => {
                let desired = parseInt(input.value, 10);
                console.log('Plan button clicked with desired seats: ', desired);
                if (isNaN(desired) || desired < state.currentStadium.getTotalSeats()) {
                    desired = state.currentStadium.getTotalSeats();
                    input.value = desired.toString();
                }
                else if (desired > MAX_SEATS) {
                    desired = MAX_SEATS;
                    input.value = MAX_SEATS.toString();
                }
                // Use store to update plannedStadium
                const planned = planner(desired, state.currentStadium);
                const plannedEnhanced = planned == null ? null : EnhancedStadium.fromStadium(planned, state.currentStadium.baseTicketPrice);
                store.setState({ plannedStadium: plannedEnhanced });
            });
        });
    }
    function createItemContainer() {
        const item = document.createElement('div');
        item.className = 'item economy';
        return item;
    }
    function makeRow(captionText, id, value) {
        const tr = document.createElement('tr');
        tr.className = 'logo-info';
        const tdIcon = document.createElement('td');
        const iconWrap = document.createElement('div');
        const icon = document.createElement('i');
        icon.className = 'fmp-icons fmp-stadium';
        iconWrap.appendChild(icon);
        tdIcon.appendChild(iconWrap);
        const tdVal = document.createElement('td');
        tdVal.style.verticalAlign = 'middle';
        const caption = document.createElement('div');
        caption.className = 'caption';
        caption.textContent = captionText;
        const val = document.createElement('div');
        val.id = id;
        val.className = 'value';
        val.textContent = value.toLocaleString();
        const sub = document.createElement('div');
        sub.className = 'subtext';
        tdVal.appendChild(caption);
        tdVal.appendChild(val);
        tdVal.appendChild(sub);
        tr.appendChild(tdIcon);
        tr.appendChild(tdVal);
        return tr;
    }
    function createTable(currentLayout) {
        const table = document.createElement('table');
        table.id = 'planner-stadium-info';
        const layout = currentLayout;
        table.appendChild(makeRow(getHostLabel('stadium.VIP Seats'), 'planner-stadium-vip', layout.vip));
        table.appendChild(makeRow(getHostLabel('stadium.Covered Seats'), 'planner-stadium-cov', layout.covered));
        table.appendChild(makeRow(getHostLabel('stadium.Other Seats'), 'planner-stadium-sea', layout.standard));
        table.appendChild(makeRow(getHostLabel('stadium.Standing'), 'planner-stadium-sta', layout.standing));
        return table;
    }

    getTranslator();
    function buildView(store) {
        const injectionPoint = findInjectionPoint();
        if (!injectionPoint)
            return;
        const mainContainer = makeMainContainer();
        // Flex row for info and planner views
        const flexRow = document.createElement('div');
        flexRow.className = 'row g-3';
        // Info view
        const infoDiv = document.createElement('div');
        infoDiv.className = 'col-12 col-md-6';
        renderInfoView(infoDiv, store);
        flexRow.appendChild(infoDiv);
        // Planner view
        const plannerDiv = document.createElement('div');
        plannerDiv.className = 'col-12 col-md-6';
        renderPlannerView(plannerDiv, store);
        flexRow.appendChild(plannerDiv);
        mainContainer.appendChild(flexRow);
        injectionPoint.appendChild(mainContainer);
    }
    function findInjectionPoint() {
        // Find the first element with all three classes: d-flex flex-row flex-wrap
        const candidates = document.querySelectorAll('div.d-flex.flex-row.flex-wrap');
        return candidates.length > 0 ? candidates[0] : null;
    }
    function makeMainContainer() {
        const container = document.createElement('div');
        container.id = 'fmp-stadium-planner';
        container.className = 'fmpx board flexbox box';
        container.style.flexGrow = '1';
        container.style.flexBasis = '400px';
        // container.style.margin = '24px 0';
        const title = makeTitleContainer("FMP Stadium Planner", null, false);
        container.appendChild(title);
        return container;
    }

    (function () {
        async function run() {
            const stadiumData = await getStadiumData();
            let stadium;
            if (stadiumData && stadiumData.stadium && stadiumData.stadium.stands) {
                stadium = new EnhancedStadium({
                    standing: stadiumData.stadium.stands.sta,
                    standard: stadiumData.stadium.stands.std,
                    covered: stadiumData.stadium.stands.cov,
                    vip: stadiumData.stadium.stands.vip,
                }, stadiumData.standingPlacePrice);
                stadium.calcMaxIncome();
            }
            else {
                // TODO: remove this fallback and show an error message to the user
                stadium = new EnhancedStadium({ standing: 11040, standard: 5520, covered: 2760, vip: 690 }, 28);
                stadium.calcMaxIncome();
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

})();
