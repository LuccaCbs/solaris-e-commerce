import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import es from './locales/es.json'
import ca from './locales/ca.json'
import eu from './locales/eu.json'

const resources = {
  en: { translation: en },
  es: { translation: es },
  ca: { translation: ca },
  eu: { translation: eu },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    supportedLngs: ['en', 'es', 'ca', 'eu'],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
