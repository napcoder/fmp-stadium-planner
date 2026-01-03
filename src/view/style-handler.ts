// Inject custom CSS if not already present
export function injectCustomStyles() {
    if (document.getElementById('fmp-stadium-planner-style')) return;
    const style = document.createElement('style');
    style.id = 'fmp-stadium-planner-style';
    style.textContent = `
        .d-flex, .flexbox, .economy {
            min-width: 0 !important;
        }
        input.form-check-input.fmp-stadium-planner-radio:checked {
            background-color: #4caf50 !important;
            border-color: #388e3c !important;
        }
        input.form-check-input.fmp-stadium-planner-radio {
            background-color: #8bb299;
        }
        .fmp-stadium-planner-input {
            background-color: #467246 !important;
            color: #cce8ba !important;
            border: 1px solid #5ea141 !important;
            border-radius: 3px !important;
        }
        .fmp-stadium-planner-button {
            border-radius: 3px !important;
        }
        .fmp-stadium-planner-list-group {
            border-radius: 3px !important;
        }
        .fmp-stadium-planner-list-item {
            color: #cce8ba !important;
            background-color: transparent !important;
            border-color: #cce8ba !important;
            border-width: 0.5px !important;
        }
    `;
    document.head.appendChild(style);
}