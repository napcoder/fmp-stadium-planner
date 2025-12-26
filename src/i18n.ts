import { planner } from "./planner";

const translations = {
    en: {
        maxIncome: "Maximum income",
        maintananceCost: "Maintanance cost",
        plan: "Plan",
        planner: "Planner",
        planned: "planned",
        current: "current",
        desiredTotalSeats: "Desired total seats",
    },
    it: {
        maxIncome: "Massimo incasso",
        maintananceCost: "Costo di manutenzione",
        plan: "Pianifica",
        planner: "Planner",
        planned: "pianificato",
        current: "attuale",
        desiredTotalSeats: "Posti totali desiderati",
    }
};

type Lang = 'it' | 'en';

function getUserLang(): Lang {
    const lang = navigator.language || navigator.languages[0] || 'en';
    return lang.startsWith('it') ? 'it' : 'en';
}

const supportedLangs: Lang[] = ['en', 'it'];

export function getTranslator(lang?: Lang) {
    let userLang = lang || getUserLang();
    if (!supportedLangs.includes(userLang)) {
        userLang = 'en';
    }
    return function t(key: keyof typeof translations['en']): string {
        return translations[userLang][key] || translations['en'][key] || key;
    };
}

// Helper to retrieve host-provided translation object `window.trxt` when available
function getHostTrxt(): any | null {
    try {
        // Prefer host globals exposed on window in browser, but also
        // support test environments where globals are on globalThis.
        const host: any = (typeof window !== 'undefined') ? (window as any) : (typeof globalThis !== 'undefined' ? (globalThis as any) : undefined);
        if (host && host.trxt) return host.trxt;
    } catch (e) {
        // ignore
    }
    return null;
}

// Try to retrieve a label from the host-provided `trxt` object.
// `label` is the key to look up; `label` is returned when not found.
export function getHostLabel(label: string): string {
    const trxt = getHostTrxt();
    if (!trxt) return label;

    try {
        return trxt[label] || label;
    } catch (e) {
        // ignore errors and fall through to fallback
    }

    return label;
}
