import { getHostLabel as ht, getTranslator } from '../i18n';
import { planner } from '../planner';
import { makeTitleContainer } from './title';
import Store, { State } from '../store';
import { MAX_SEATS } from '../settings';
import { SeatsRatio } from '../seats-ratio';
import { createPlannerAutomaticView } from './planner-automatic-view';

const t = getTranslator();

export enum PlannerMode {
    PRESET_KHRISTIAN = 'preset-khristian',
    PRESET_TICKETS = 'preset-tickets',
    CUSTOM = 'custom',
    ADVANCED = 'advanced',
}

interface PlannerViewContext {
    modeSelected: PlannerMode;
    currentSeatsRatio: SeatsRatio | null;
    desiredTotalSeats?: number | null;
    onModeChange: (mode: PlannerMode, seatsRatio?: SeatsRatio | null) => void;
    onDesiredTotalSeatsChange: (seats: number | null) => void;
    onCurrentSeatsRatioChange: (seatsRatio: SeatsRatio) => void;
    onPlanClick: () => void;
}

// Renders planner-view and subscribes to store updates
export function renderPlannerView(container: HTMLElement, store: Store) {
    container.innerHTML = '';
    let componentContext: PlannerViewContext = {
        modeSelected: PlannerMode.PRESET_KHRISTIAN,
        currentSeatsRatio: SeatsRatio.getDefaultRatio(),
        desiredTotalSeats: store.getState().plannedStadium?.getTotalSeats() || store.getState().currentStadium.getTotalSeats(),
        onModeChange: (mode: PlannerMode, seatsRatio?: SeatsRatio | null) => {
            const newContext = { 
                ...componentContext,
                modeSelected: mode,
            };
            if (seatsRatio !== undefined) {
                newContext.currentSeatsRatio = seatsRatio;
            }
            componentContext = newContext;
            onStateUpdate(container, store.getState(), store, newContext);
        },
        onDesiredTotalSeatsChange: (seats: number | null) => {
            const newContext = { 
                ...componentContext,
                desiredTotalSeats: seats
            };
            componentContext = newContext;
        },
        onCurrentSeatsRatioChange: (seatsRatio: SeatsRatio) => {
            const newContext = { 
                ...componentContext,
                currentSeatsRatio: seatsRatio
            };
            componentContext = newContext;
        },
        onPlanClick: () => {
            let desiredTotal = componentContext.desiredTotalSeats;
            let shouldUpdateInput = false;
            const state = store.getState();
            if (!desiredTotal || isNaN(desiredTotal) || desiredTotal < state.currentStadium.getTotalSeats()) {
                desiredTotal = state.currentStadium.getTotalSeats();
                shouldUpdateInput = true;
            } else if (desiredTotal > MAX_SEATS) {
                desiredTotal = MAX_SEATS;
                shouldUpdateInput = true;
            }
            // Use store to update plannedStadium
            const planned = planner(desiredTotal, state.currentStadium, componentContext.currentSeatsRatio || SeatsRatio.getDefaultRatio());
            if (shouldUpdateInput) {
                const newContext = { 
                    ...componentContext,
                    desiredTotalSeats: desiredTotal
                };
                componentContext = newContext;
            }
            store.setState({ plannedStadium: planned });
        },
    };
    store.subscribe((state: State, prevState: State) => {
        onStateUpdate(container, state, store, componentContext);
    });
}

function onStateUpdate(container: HTMLElement, state: State, store: Store, componentContext: PlannerViewContext) {
    container.innerHTML = '';
    const title = makeTitleContainer('FMP Stadium Planner', t('planner'));
    container.appendChild(title);
    const itemContainer = createItemContainer();
    container.appendChild(itemContainer);

    const controlsContainer = createModeControls(componentContext.modeSelected, componentContext.onModeChange);
    itemContainer.appendChild(controlsContainer);

    // Mode-specific views
    if (componentContext.modeSelected === PlannerMode.ADVANCED) {
        const advancedView = createAdvancedView();
        itemContainer.appendChild(advancedView);
    } else {
        const automaticView = createPlannerAutomaticView({
            modeSelected: componentContext.modeSelected,
            currentSeatsRatio: componentContext.currentSeatsRatio,
            desiredTotalSeats: componentContext.desiredTotalSeats,
            onDesiredTotalSeatsChange: componentContext.onDesiredTotalSeatsChange,
            desiredTotalSeatsMin: state.currentStadium.getTotalSeats(),
            desiredTotalSeatsMax: MAX_SEATS,
            onCurrentSeatsRatioChange: componentContext.onCurrentSeatsRatioChange,
            currentSeatsLayout: state.plannedStadium?.getLayout() || state.currentStadium.getLayout(),
            onPlanClick: componentContext.onPlanClick,
        });
        itemContainer.appendChild(automaticView);
    }
}

function createItemContainer(): HTMLElement {
    const item = document.createElement('div');
    item.className = 'item economy';
    return item;
}

function createModeControls(selectedMode: PlannerMode, onModeChange: (mode: PlannerMode, seatsRatio?: SeatsRatio | null) => void) : HTMLElement{
    const mainContainer = document.createElement('div');
    mainContainer.className = 'mb-3';
    
    const modes = [
        { value: PlannerMode.PRESET_KHRISTIAN, label: t('controlsAutomaticKhristianLabel'), seatsRatio: SeatsRatio.getDefaultRatio() },
        { value: PlannerMode.PRESET_TICKETS, label: t('controlsAutomaticTicketsLabel'), seatsRatio: SeatsRatio.getMaintananceOptimizedRatio() },
        { value: PlannerMode.CUSTOM, label: t('controlsAutomaticCustomLabel'), seatsRatio: undefined },
        { value: PlannerMode.ADVANCED, label: t('controlsAdvancedManualLabel'), seatsRatio: null },
    ];

    modes.forEach(mode => {
        const formCheck = document.createElement('div');
        formCheck.className = 'form-check';

        const input = document.createElement('input');
        input.className = 'form-check-input fmp-stadium-planner-radio';
        input.type = 'radio';
        input.name = 'mode';
        input.id = `mode-${mode.value}`;
        input.value = mode.value;
        if (selectedMode === mode.value) {
            input.checked = true;
        }
        if (mode.value === PlannerMode.ADVANCED) {
            input.disabled = true; // Advanced mode is disabled for now
        }

        input.addEventListener('change', () => {
            onModeChange(mode.value, mode.seatsRatio);
        });

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `mode-${mode.value}`;
        label.textContent = mode.label;

        formCheck.appendChild(input);
        formCheck.appendChild(label);
        mainContainer.appendChild(formCheck);
    });

    return mainContainer;
}

function createAdvancedView(): HTMLElement {
    const container = document.createElement('div');
    container.textContent = 'Advanced view content goes here.';
    return container;
}

