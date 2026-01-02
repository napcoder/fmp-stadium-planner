import { getHostLabel as ht, getTranslator } from '../i18n';
import Store, { State } from '../store';
import { UpgradeManager } from '../upgrade-manager';
import { makeTitleContainer } from './title';

const t = getTranslator();


// Renders general-info-view and subscribes to store updates
export function renderGeneralInfoView(container: HTMLElement, store: Store) {
    // Clear container
    container.innerHTML = '';
    // Subscribe to store
    store.subscribe((state: State, prevState: State) => {
        const totalSeats = state.currentStadium.getTotalSeats();
        const currentRatio = state.currentStadium.getRatio().toString();
        const maxIncome = state.currentStadium.calcMaxIncome(state.baseTicketPrice);
        const maintainanceCost = state.currentStadium.getMaintainCost();

        container.innerHTML = '';
        const title = makeTitleContainer('FMP Stadium Planner', t('currentInfoTitle'));
        container.appendChild(title);
        const content = createItemContainer();

        const totalSeatsRow = createRow(t('totalSeats'), totalSeats.toLocaleString());
        const currentRatioRow = createRow(t('ratioLabel'), currentRatio);
        const maintainanceCostRow = createRow(t('maintananceCost'), `ⓕ ${maintainanceCost.toLocaleString()}`);
        const maxIncomeRow = createRow(t('maxIncome'), `ⓕ ${maxIncome.toLocaleString()}`);
        
        content.appendChild(totalSeatsRow);
        content.appendChild(currentRatioRow);
        content.appendChild(maintainanceCostRow);
        content.appendChild(maxIncomeRow);
        container.appendChild(content);

        // Planned stadium info (if available)
        if (state.plannedStadium) {
            const upgradeManager = new UpgradeManager(state.currentStadium.getLayout(), state.baseTicketPrice, state.plannedStadium.getLayout());
            const plannedMaxIncome = state.plannedStadium.calcMaxIncome(state.baseTicketPrice);
            const plannedMaintainanceCost = state.plannedStadium.getMaintainCost();
            const plannedTotalSeats = state.plannedStadium.getTotalSeats();
            const plannedBuildingCost = upgradeManager.getTotalBuildingCost();
            const plannedTimeToBuild = upgradeManager.getTotalTimeToBuild();
            const plannedRatio = state.plannedStadium.getRatio().toString();
            
            const plannedTitle = makeTitleContainer(null, t('plannedInfoTitle'));
            container.appendChild(plannedTitle);
            const plannedContent = createItemContainer();

            const plannedTotalSeatsRow = createRow(t('totalSeats'), plannedTotalSeats.toLocaleString());
            const plannedRatioRow = createRow(t('ratioLabel'), plannedRatio);
            const plannedMaintainanceCostRow = createRow(t('maintananceCost'), `ⓕ ${plannedMaintainanceCost.toLocaleString()}`);
            const plannedMaxIncomeRow = createRow(t('maxIncome'), `ⓕ ${plannedMaxIncome.toLocaleString()}`);
            const plannedBuildingCostRow = createRow(t('buildingCost'), `ⓕ ${plannedBuildingCost.toLocaleString()}`);
            const plannedTimeToBuildRow = createRow(t('timeToBuild'), `${plannedTimeToBuild} ${t('days')}`);

            plannedContent.appendChild(plannedTotalSeatsRow);
            plannedContent.appendChild(plannedRatioRow);
            plannedContent.appendChild(plannedMaintainanceCostRow);
            plannedContent.appendChild(plannedMaxIncomeRow);
            plannedContent.appendChild(plannedBuildingCostRow);
            plannedContent.appendChild(plannedTimeToBuildRow);

            container.appendChild(plannedContent);
        }
    });
}

function createItemContainer(): HTMLElement {
    const item = document.createElement('div');
    item.className = 'item economy';
    item.style.padding = '0 8px 0 24px'
    return item;
}

function createRow(captionText: string, value: string): HTMLElement {
    const row = document.createElement('div');
    row.className = 'row g-0';
    row.style.padding = '4px 0 4px 0';
    row.style.borderBottom = '1px solid #103201';

    const col1 = document.createElement('div');
    col1.className = 'col-6';
    col1.textContent = captionText;

    const col2 = document.createElement('div');
    col2.className = 'col-6 text-end';
    col2.textContent = value;

    row.appendChild(col1);
    row.appendChild(col2);
    return row;
}