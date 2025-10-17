import { getRequestConfig } from 'next-intl/server';

const dict = {
  tr: () => import('./messages/tr.json'),
  en: () => import('./messages/en.json'),
  de: () => import('./messages/de.json'),
  fr: () => import('./messages/fr.json')
};

export default getRequestConfig(async ({ locale }) => {
  const key = (locale || 'tr').toLowerCase().split('-')[0];
  const load = dict[key] ?? dict.tr;
  const messages = (await load()).default;
  return { messages, locale: key };
});

