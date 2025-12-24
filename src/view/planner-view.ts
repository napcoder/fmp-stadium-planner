import { getHostLabel as ht, getTranslator } from '../i18n';
import { EnhancedStadium, SeatsLayout } from '../stadium';
import { planner } from '../planner';
import { makeTitleContainer } from './title';
import Store, { State } from '../store';

const t = getTranslator();
const MAX_SEATS = 1000000;


// Renders planner-view and subscribes to store updates
export function renderPlannerView(container: HTMLElement, store: Store) {
    container.innerHTML = '';
    store.subscribe((state: State, prevState: State) => {
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
            } else if (desired > MAX_SEATS) {
                desired = MAX_SEATS;
                input.value = MAX_SEATS.toString();
            }
            // Use store to update plannedStadium
            const planned = planner(desired, state.currentStadium)
            const plannedEnhanced = planned == null ? null : EnhancedStadium.fromStadium(planned, state.currentStadium.baseTicketPrice);
            store.setState({ plannedStadium: plannedEnhanced });
        });
    });
}

function createItemContainer(): HTMLElement {
    const item = document.createElement('div');
    item.className = 'item economy';
    return item;
}

function makeRow(captionText: string, id: string, value: number) {
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

function createTable(currentLayout: SeatsLayout): HTMLElement {
    const table = document.createElement('table');
    table.id = 'planner-stadium-info';
    const layout = currentLayout;

    table.appendChild(makeRow(ht('stadium.VIP Seats'), 'planner-stadium-vip', layout.vip));
    table.appendChild(makeRow(ht('stadium.Covered Seats'), 'planner-stadium-cov', layout.covered));
    table.appendChild(makeRow(ht('stadium.Other Seats'), 'planner-stadium-sea', layout.standard));
    table.appendChild(makeRow(ht('stadium.Standing'), 'planner-stadium-sta', layout.standing));

    return table;
}
