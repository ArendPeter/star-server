// https://dev.to/adrai/how-to-properly-internationalize-a-react-application-using-i18next-3hdb
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.yaml';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options

  .init({
    debug: true,
    returnObjects: true,
    // I need to keep the whitelist up to date for the commalistSeparator
    // https://github.com/i18next/react-i18next/issues/475
    whitelist: ['en'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: en
      }
    }
  });

export default i18n;