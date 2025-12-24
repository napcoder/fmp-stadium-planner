import { getHostLabel as ht, getTranslator } from '../i18n';
import { planner } from '../planner';
import { Stadium } from '../stadium';
import Store from '../store';
import { renderInfoView } from './info-view';
import { renderPlannerView } from './planner-view';
import { makeTitleContainer } from './title';

const t = getTranslator();

export function buildView(store: Store) {
    const injectionPoint = findInjectionPoint();
    if (!injectionPoint) return;

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


function findInjectionPoint(): HTMLElement | null {
    // Find the first element with all three classes: d-flex flex-row flex-wrap
    const candidates = document.querySelectorAll('div.d-flex.flex-row.flex-wrap');
    return candidates.length > 0 ? (candidates[0] as HTMLElement) : null;
}

function makeMainContainer(): HTMLElement {
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
