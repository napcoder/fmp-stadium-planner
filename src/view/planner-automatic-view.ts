import { getHostLabel, getTranslator } from "../i18n";
import { SeatsRatio } from "../seats-ratio";
import { SeatsLayout } from "../stadium";
import { PlannerMode } from "./planner-view";

const t = getTranslator();

interface Props {
    currentSeatsLayout: SeatsLayout;
    modeSelected: PlannerMode;
    currentSeatsRatio: SeatsRatio | null;
    desiredTotalSeats?: number | null;
    desiredTotalSeatsMin: number;
    desiredTotalSeatsMax: number;
    onDesiredTotalSeatsChange: (seats: number | null) => void;
    onCurrentSeatsRatioChange: (seatsRatio: SeatsRatio) => void;
    onPlanClick: () => void;
}

export function createPlannerAutomaticView(props: Props): HTMLElement {
    const autoInputsContainer = document.createElement('div');
    autoInputsContainer.id = 'autoInputsContainer';

    const desiredTotalContainer = document.createElement('div');
    desiredTotalContainer.className = 'mb-3';

    const desiredTotalLabel = document.createElement('label');
    desiredTotalLabel.className = 'form-label';
    desiredTotalLabel.htmlFor = 'totalSeats';
    desiredTotalLabel.textContent = t('desiredTotalSeats');

    const desiredTotalInput = document.createElement('input');
    desiredTotalInput.type = 'number';
    desiredTotalInput.className = 'form-control fmp-stadium-planner-input';
    desiredTotalInput.id = 'desiredTotalSeatsInput';
    desiredTotalInput.min = props.desiredTotalSeatsMin.toString();
    desiredTotalInput.max = props.desiredTotalSeatsMax.toString();
    desiredTotalInput.value = props.desiredTotalSeats?.toString() || '';
    desiredTotalInput.placeholder = props.desiredTotalSeats?.toString() || '';
    desiredTotalInput.addEventListener('input', () => {
        const value = parseInt(desiredTotalInput.value, 10);
        if (isNaN(value)) {
            props.onDesiredTotalSeatsChange(null);
        } else {
            props.onDesiredTotalSeatsChange(value);
        }
    });

    desiredTotalContainer.appendChild(desiredTotalLabel);
    desiredTotalContainer.appendChild(desiredTotalInput);
    autoInputsContainer.appendChild(desiredTotalContainer);

    const ratioContainer = document.createElement('div');
    ratioContainer.id = 'ratioContainer';
    ratioContainer.className = 'mb-3';

    const ratioLabel = document.createElement('label');
    ratioLabel.className = 'form-label';
    ratioLabel.textContent = t('seatsRatioExtendedLabel');
    ratioContainer.appendChild(ratioLabel);
    autoInputsContainer.appendChild(ratioContainer);

    if (props.modeSelected === PlannerMode.CUSTOM) {
        const customView = createAutomaticCustomView(props.currentSeatsRatio || SeatsRatio.getDefaultRatio(), props.onCurrentSeatsRatioChange);
        ratioContainer.appendChild(customView);
    } else {
        const presetRatioValue = document.createElement('div');
        presetRatioValue.className = 'h4';
        presetRatioValue.id = 'presetLabel';
        presetRatioValue.textContent = props.currentSeatsRatio?.toString() || '';
        ratioContainer.appendChild(presetRatioValue);
    }
    const description = document.createElement('div');
    description.textContent = t('seatsRatioDescription');
    ratioContainer.appendChild(description);

    const previewLayout = createGeneratedLayoutView(props.currentSeatsLayout);
    autoInputsContainer.appendChild(previewLayout);

    const planButton = document.createElement('button');
    planButton.className = 'btn fmp-btn btn-green fmp-stadium-planner-button w-100 mt-3 btn-lg';
    planButton.id = 'planBtn';
    planButton.textContent = t('plan').toLocaleUpperCase();
    planButton.style.paddingBottom = '16px';
    planButton.style.paddingTop = '16px';
    planButton.style.fontSize = '1.5rem';
    planButton.addEventListener('click', props.onPlanClick);
    autoInputsContainer.appendChild(planButton);

    return autoInputsContainer;
}


function createAutomaticCustomView(currentSeatsRatio: SeatsRatio, onCurrentSeatsRatioChange: (seatsRatio: SeatsRatio) => void): HTMLElement {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'd-flex gap-2';

    function inputEventHandler() {
        let vip = parseInt(vipInput.value, 10) || 0;
        if (vip < 0) vip = 0;
        if (vip > 1) vip = 1;
        let covered = parseInt(coveredInput.value, 10) || 0;
        if (covered < 1) covered = 1;
        let standard = parseInt(standardInput.value, 10) || 0;
        if (standard < 1) standard = 1;
        let standing = parseInt(standingInput.value, 10) || 0;
        if (standing < 1) standing = 1;
        onCurrentSeatsRatioChange(new SeatsRatio({vip, covered, standard, standing}));
    }

    const vipInput = document.createElement('input');
    const isVipEnabled = currentSeatsRatio.vip !== 1;
    if (isVipEnabled) {
        vipInput.type = 'number';
    }
    vipInput.className = 'form-control text-center ratio fmp-stadium-planner-input';
    vipInput.value = currentSeatsRatio.vip.toString();
    vipInput.min = '0';
    vipInput.max = '1';
    vipInput.addEventListener('input', inputEventHandler)
    vipInput.disabled = !isVipEnabled;

    const coveredInput = document.createElement('input');
    coveredInput.type = 'number';
    coveredInput.className = 'form-control text-center ratio fmp-stadium-planner-input';
    coveredInput.value = currentSeatsRatio.covered.toString();
    coveredInput.min = '1';
    coveredInput.addEventListener('input', inputEventHandler)

    const standardInput = document.createElement('input');
    standardInput.type = 'number';
    standardInput.className = 'form-control text-center ratio fmp-stadium-planner-input';
    standardInput.value = currentSeatsRatio.standard.toString();
    standardInput.min = '1';
    standardInput.addEventListener('input', inputEventHandler)

    const standingInput = document.createElement('input');
    standingInput.type = 'number';
    standingInput.className = 'form-control text-center ratio fmp-stadium-planner-input';
    standingInput.value = currentSeatsRatio.standing.toString();
    standingInput.min = '1';
    standingInput.addEventListener('input', inputEventHandler)

    inputContainer.appendChild(vipInput);
    inputContainer.appendChild(coveredInput);
    inputContainer.appendChild(standardInput);
    inputContainer.appendChild(standingInput);

    return inputContainer;
}

function createGeneratedLayoutView(layout: SeatsLayout): HTMLElement {
    const previewContainer = document.createElement('div');
    previewContainer.id = 'preview';
    previewContainer.className = 'mt-3';

    const title = document.createElement('div');
    title.className = 'fw-bold mb-2';
    title.textContent = t('lastGeneratedLayoutTitle');
    previewContainer.appendChild(title);

    const listGroup = document.createElement('ul');
    listGroup.className = 'list-group fmp-stadium-planner-list-group';
    // listGroup.style.borderRadius = '3px';

    const vipItem = document.createElement('li');
    vipItem.className = 'list-group-item fmp-stadium-planner-list-item';
    vipItem.innerHTML = `<i class="fmp-icons fmp-stadium" style="font-size: 20px;"></i> ${getHostLabel('stadium.VIP Seats')} <span class="float-end">${layout.vip}</span>`;
    listGroup.appendChild(vipItem);

    const coveredItem = document.createElement('li');
    coveredItem.className = 'list-group-item fmp-stadium-planner-list-item';
    coveredItem.innerHTML = `<i class="fmp-icons fmp-stadium" style="font-size: 20px;"></i> ${getHostLabel('stadium.Covered Seats')} <span class="float-end">${layout.covered}</span>`;
    listGroup.appendChild(coveredItem);

    const standardItem = document.createElement('li');
    standardItem.className = 'list-group-item fmp-stadium-planner-list-item';
    standardItem.innerHTML = `<i class="fmp-icons fmp-stadium" style="font-size: 20px;"></i> ${getHostLabel('stadium.Other Seats')} <span class="float-end">${layout.standard}</span>`;
    listGroup.appendChild(standardItem);

    const standingItem = document.createElement('li');
    standingItem.className = 'list-group-item fmp-stadium-planner-list-item';
    standingItem.innerHTML = `<i class="fmp-icons fmp-stadium" style="font-size: 20px;"></i> ${getHostLabel('stadium.Standing')} <span class="float-end">${layout.standing}</span>`;
    listGroup.appendChild(standingItem);

    const totalItem = document.createElement('li');
    totalItem.className = 'list-group-item fw-bold fmp-stadium-planner-list-item';
    const totalSeats = layout.vip + layout.covered + layout.standard + layout.standing;
    totalItem.innerHTML = `<i class="fmp-icons fmp-stadium" style="font-size: 20px;"></i> ${t('totalSeats')} <span class="float-end">${totalSeats}</span>`;
    listGroup.appendChild(totalItem);

    previewContainer.appendChild(listGroup);
    return previewContainer;
}