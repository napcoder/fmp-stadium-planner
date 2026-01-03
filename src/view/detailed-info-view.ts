import { getHostLabel as ht, getTranslator } from '../i18n';
import Store, { State } from '../store';
import { UpgradeManager } from '../upgrade-manager';
import { makeTitleContainer } from './title';

const t = getTranslator();

export function renderDetailedInfoView(container: HTMLElement, store: Store) {
    // Clear container
    container.innerHTML = '';
    // Subscribe to store
    store.subscribe((state: State, prevState: State) => {
        container.innerHTML = '';
        const infoTitle = makeTitleContainer('FMP Stadium Planner', t('detailedInfoTitle'), false);
        container.appendChild(infoTitle);
        const content = createItemContainer();

        const upgradeManager = new UpgradeManager(state.currentStadium.getLayout(), state.baseTicketPrice, state.plannedStadium.getLayout());

        const table = createMainTable(state, upgradeManager);
        content.appendChild(table);
        container.appendChild(content);
    });
}

function createHeaders(captions: string[], addPadding: boolean = false): HTMLElement {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    captions.forEach((caption, index) => {
        // all but first are right-aligned
        const th = document.createElement('th');
        th.textContent = caption;
        if (index > 0) {
            th.style.textAlign = 'right';
        }
        th.style.borderColor = '#a2dc7d';
        if (addPadding) {
            th.style.paddingTop = '24px';
        }
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    return thead;
}

function createRow(cells: string[]): HTMLElement {
    const row = document.createElement('tr');
    cells.forEach((cellText, index) => {
        // all but first are right-aligned
        const cell = document.createElement('td');
        cell.textContent = cellText;
        if (index > 0) {
            cell.style.textAlign = 'right';
        }
        cell.style.borderColor = '#103201';
        row.appendChild(cell);
    });
    return row;
}

function createMainTable(state: State, upgradeManager: UpgradeManager): HTMLElement {
    // container responsive div
    const containerDiv = document.createElement('div');
    containerDiv.className = 'table-responsive';

    // create table
    const table = document.createElement('table');
    table.className = 'table table-hover';
    table.style.minWidth = '600px'; // ensure table is wide enough, important for responsiveness
    
    appendInfoTableSection(table, state);
    appendSectorsTableSection(table, state, upgradeManager);
    
    containerDiv.appendChild(table);
    return containerDiv;
}

function appendInfoTableSection(table: HTMLTableElement, state: State): void {
    // header
    const tableHead = createHeaders(["", t('current'), t('planned'), t('delta')]);
    table.appendChild(tableHead);

    // body
    const tableBody = document.createElement('tbody');
    // tableBody.className = 'table-group-divider';
    const totalSeatsRow = createRow([
        t('totalSeats'),
        state.currentStadium.getTotalSeats().toLocaleString(),
        state.plannedStadium.getTotalSeats().toLocaleString(),
        (state.plannedStadium.getTotalSeats() - state.currentStadium.getTotalSeats()).toLocaleString()
    ]);  
    tableBody.appendChild(totalSeatsRow);

    const vipSeatsRow = createRow([
        ht('stadium.VIP Seats'),
        state.currentStadium.getLayout().vip.toLocaleString(),
        state.plannedStadium.getLayout().vip.toLocaleString(),
        (state.plannedStadium.getLayout().vip - state.currentStadium.getLayout().vip).toLocaleString()
    ]);
    tableBody.appendChild(vipSeatsRow);

    const coveredSeatsRow = createRow([
        ht('stadium.Covered Seats'),
        state.currentStadium.getLayout().covered.toLocaleString(),
        state.plannedStadium.getLayout().covered.toLocaleString(),
        (state.plannedStadium.getLayout().covered - state.currentStadium.getLayout().covered).toLocaleString()
    ]);  
    tableBody.appendChild(coveredSeatsRow);
    
    const standardSeatsRow = createRow([
        ht('stadium.Other Seats'),
        state.currentStadium.getLayout().standard.toLocaleString(),
        state.plannedStadium.getLayout().standard.toLocaleString(),
        (state.plannedStadium.getLayout().standard - state.currentStadium.getLayout().standard).toLocaleString()
    ]);
    tableBody.appendChild(standardSeatsRow);

    const standingSeatsRow = createRow([
        ht('stadium.Standing'),
        state.currentStadium.getLayout().standing.toLocaleString(),
        state.plannedStadium.getLayout().standing.toLocaleString(),
        (state.plannedStadium.getLayout().standing - state.currentStadium.getLayout().standing).toLocaleString()
    ]);
    tableBody.appendChild(standingSeatsRow);

    const maintenanceCostRow = createRow([
        t('maintenanceCost'),
        `ⓕ ${state.currentStadium.getMaintainCost().toLocaleString()}`,
        `ⓕ ${state.plannedStadium.getMaintainCost().toLocaleString()}`,
        `ⓕ ${(state.plannedStadium.getMaintainCost() - state.currentStadium.getMaintainCost()).toLocaleString()}`
    ]);  
    tableBody.appendChild(maintenanceCostRow);

    const maxIncomeRow = createRow([
        t('maxIncome'),
        `ⓕ ${state.currentStadium.calcMaxIncome(state.baseTicketPrice).toLocaleString()}`,
        `ⓕ ${state.plannedStadium.calcMaxIncome(state.baseTicketPrice).toLocaleString()}`,
        `ⓕ ${(state.plannedStadium.calcMaxIncome(state.baseTicketPrice) - state.currentStadium.calcMaxIncome(state.baseTicketPrice)).toLocaleString()}`
    ]);  
    tableBody.appendChild(maxIncomeRow);

    const maxIncomeWithoutSeasonTicketsRow = createRow([
        t('maxIncomeWithoutSeasonTickets'),
        `ⓕ ${state.currentStadium.calcMaxIncomeWithoutSeasonTickets(state.baseTicketPrice, state.seasonTickets).toLocaleString()}`,
        `ⓕ ${state.plannedStadium.calcMaxIncomeWithoutSeasonTickets(state.baseTicketPrice, state.seasonTickets).toLocaleString()}`,
        `ⓕ ${(state.plannedStadium.calcMaxIncomeWithoutSeasonTickets(state.baseTicketPrice, state.seasonTickets) - state.currentStadium.calcMaxIncomeWithoutSeasonTickets(state.baseTicketPrice, state.seasonTickets)).toLocaleString()}`
    ]);  
    tableBody.appendChild(maxIncomeWithoutSeasonTicketsRow);
    
    table.appendChild(tableBody);
}

function appendSectorsTableSection(table: HTMLTableElement, state: State, upgradeManager: UpgradeManager): void {
    const vipCost = upgradeManager.getVipBuildingCost();
    const coveredCost = upgradeManager.getCoveredBuildingCost();
    const standardCost = upgradeManager.getStandardBuildingCost();
    const standingCost = upgradeManager.getStandingBuildingCost();
    const totalCost = upgradeManager.getTotalBuildingCost();

    const vipTime = upgradeManager.getVipTimeToBuild();
    const coveredTime = upgradeManager.getCoveredTimeToBuild();
    const standardTime = upgradeManager.getStandardTimeToBuild();
    const standingTime = upgradeManager.getStandingTimeToBuild();
    const totalTime = upgradeManager.getTotalTimeToBuild();

    // header
    const thead = createHeaders([t('constructionDetailsTitle'), t('sizeDelta'), t('costsTableHeader'), t('timeTableHeader')], true);
    table.appendChild(thead);

    // body
    const tableBody = document.createElement('tbody');
    // tableBody.className = 'table-group-divider';
    table.appendChild(tableBody);

    const vipSeatsRow = createRow([
        ht('stadium.VIP Seats'),
        (state.plannedStadium.getLayout().vip - state.currentStadium.getLayout().vip).toLocaleString(),
        vipCost.toLocaleString(),
        `${vipTime}`,
    ]);
    tableBody.appendChild(vipSeatsRow);

    const coveredSeatsRow = createRow([
        ht('stadium.Covered Seats'),
        (state.plannedStadium.getLayout().covered - state.currentStadium.getLayout().covered).toLocaleString(),
        coveredCost.toLocaleString(),
        `${coveredTime}`,
    ]);
    tableBody.appendChild(coveredSeatsRow);
    
    const standardSeatsRow = createRow([
        ht('stadium.Other Seats'),
        (state.plannedStadium.getLayout().standard - state.currentStadium.getLayout().standard).toLocaleString(),
        standardCost.toLocaleString(),
        `${standardTime}`,
    ]);
    tableBody.appendChild(standardSeatsRow);

    const standingSeatsRow = createRow([
        ht('stadium.Standing'),
        (state.plannedStadium.getLayout().standing - state.currentStadium.getLayout().standing).toLocaleString(),
        standingCost.toLocaleString(),
        `${standingTime}`,
    ]);
    tableBody.appendChild(standingSeatsRow);

    const totalRow = createRow([
        t('total'),
        (state.plannedStadium.getTotalSeats() - state.currentStadium.getTotalSeats()).toLocaleString(),
        totalCost.toLocaleString(),
        `${totalTime}`,
    ]);
    tableBody.appendChild(totalRow);
}

function createItemContainer(): HTMLElement {
    const item = document.createElement('div');
    item.className = 'item economy';
    return item;
}
