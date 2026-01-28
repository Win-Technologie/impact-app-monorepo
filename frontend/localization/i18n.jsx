import i18n from "i18next";
import Expo from "expo";
import { initReactI18next } from "react-i18next";
import translationEN from "./en/translation.json";
import translationFR from "./fr/translation.json";

export const resources = {
  en: {
    translation: translationEN,
  },

  fr: {
    translation: translationFR,
  },
};

i18n.use(initReactI18next).init({
  resources,
  compatibilityJSON: "v3",
  lng: "fr",
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
  react: { useSuspense: false }, //this line
});

export default i18n;
