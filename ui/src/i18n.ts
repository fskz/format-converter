import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'zh-CN',
  resources: {
    'zh-CN': {
      translation: {
        app: {
          title: '格式转换器',
        },
      },
    },
    'en-US': {
      translation: {
        app: {
          title: 'Format Converter',
        },
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
