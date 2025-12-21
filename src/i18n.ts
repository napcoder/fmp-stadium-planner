
const translations = {
    en: {
        maxIncome: "Maximum income:"
    },
    it: {
        maxIncome: "Massimo incasso:"
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
