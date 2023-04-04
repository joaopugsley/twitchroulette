import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

i18n.use(initReactI18next).init({
    resources: {
        'pt': pt,
        'en': en,
        'es': es
    },
    lng: 'en',
    interpolation: {
        escapeValue: false,
    }
})

export default i18n;