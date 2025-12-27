import { getHostLabel as ht, getTranslator } from '../i18n';
import Store from '../store';
import { renderGeneralInfoView } from './general-info-view';
// import { renderInfoView } from './info-view';
import { renderPlannerView } from './planner-view';
import { VERSION } from '../settings';
import { renderDetailedInfoView } from './detailed-info-view';

const t = getTranslator();

export function buildView(store: Store) {
    const injectionPoint = findInjectionPoint();
    if (!injectionPoint) {
        console.error('FMP Stadium Planner: Unable to find injection point in DOM.');
        return;
    }

    // Add styles for responsive tables
    const style = document.createElement('style');
    style.textContent = `
        .d-flex, .flexbox, .economy {
            min-width: 0 !important;
        }
    `;
    document.head.appendChild(style);

    const mainHeader = makeMainHeader(VERSION);
    const mainContainer = makeMainContainer();

    injectionPoint.after(mainHeader);
    mainHeader.after(mainContainer);

    // Planner view
    const plannerSection = makeSectionContainer();
    renderPlannerView(plannerSection, store);
    mainContainer.appendChild(plannerSection);

    // General info view
    const generalInfoSection = makeSectionContainer();
    renderGeneralInfoView(generalInfoSection, store);
    mainContainer.appendChild(generalInfoSection);

    // Detailed info view
    const detailedInfoSection = makeSectionContainer();
    detailedInfoSection.style.flexBasis = '100%';
    renderDetailedInfoView(detailedInfoSection, store);
    mainContainer.appendChild(detailedInfoSection);
}


function findInjectionPoint(): HTMLElement | null {
    // Find the first element with all three classes: d-flex flex-row flex-wrap
    const candidates = document.querySelectorAll('div.d-flex.flex-row.flex-wrap');
    return candidates.length > 0 ? (candidates[0] as HTMLElement) : null;
}

function makeSectionContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'fmpx board flexbox box';
    container.style.flexGrow = '1';
    container.style.flexBasis = '400px';
    return container;
}

function makeMainContainer() {
    const container = document.createElement('div');
    container.id = 'fmp-stadium-planner-main';
    container.className = 'd-flex flex-row flex-wrap';
    return container;
}

function makeMainHeader(version: string): HTMLElement {
    const mainContainer = document.createElement('div');
    mainContainer.id = 'fmp-stadium-planner-header';
    mainContainer.className = 'd-flex';
    mainContainer.style.marginTop = '12px';
    const panelHeader = document.createElement('div');
    panelHeader.className = 'panel header flex-grow-1';
    const header = document.createElement('div');
    header.className = 'lheader';
    const title = document.createElement('h3');
    title.textContent = 'FMP Stadium Planner';
    const versionSubtitle = document.createElement('h6');
    versionSubtitle.textContent = `v${version}`;
    header.appendChild(title);
    header.appendChild(versionSubtitle);
    panelHeader.appendChild(header);
    mainContainer.appendChild(panelHeader);
    return mainContainer;
}
