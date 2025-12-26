import { getHostLabel as ht, getTranslator } from '../i18n';
import Store, { State } from '../store';
import { makeTitleContainer } from './title';

const t = getTranslator();


// Renders info-view and subscribes to store updates
export function renderInfoView(container: HTMLElement, store: Store) {
    // Clear container
    container.innerHTML = '';
    // Subscribe to store
    store.subscribe((state: State, prevState: State) => {
        container.innerHTML = '';
        const title = makeTitleContainer(null, ht('stadium.Information'));
        container.appendChild(title);
        const content = createItemContainer();
        // Current stadium info
        const currentInfo = document.createElement('div');
        currentInfo.id = 'fmp-stadium-current-info';
        const maxIncome = state.currentStadium.calcMaxIncome(state.baseTicketPrice);
        const maintainanceCost = state.currentStadium.getMaintainCost();
        currentInfo.innerHTML = `<p>${t('maxIncome')} (${t('current')}): ${maxIncome.toLocaleString()}ⓕ</p>`;
        currentInfo.innerHTML += `<p>${t('maintananceCost')} (${t('current')}): ${maintainanceCost.toLocaleString()}ⓕ</p>`;
        content.appendChild(currentInfo);
        // Planned stadium info (if available)
        if (state.plannedStadium) {
            const plannedInfo = document.createElement('div');
            plannedInfo.id = 'fmp-stadium-planned-info';
            const plannedMaxIncome = state.plannedStadium.calcMaxIncome(state.baseTicketPrice);
            const plannedMaintainanceCost = state.plannedStadium.getMaintainCost();
            plannedInfo.innerHTML = `<p>${t('maxIncome')} (${t('planned')}): ${plannedMaxIncome.toLocaleString()}ⓕ</p>`;
            plannedInfo.innerHTML += `<p>${t('maintananceCost')} (${t('planned')}): ${plannedMaintainanceCost.toLocaleString()}ⓕ</p>`;
            content.appendChild(plannedInfo);
        }
        container.appendChild(content);
    });
}

function createItemContainer(): HTMLElement {
    const item = document.createElement('div');
    item.className = 'item economy';
    return item;
}