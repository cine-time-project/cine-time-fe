import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';

const SUPPORTED = ['tr','en','de','fr'];

const dictionaries = {
  tr: () => import('../../i18n/messages/tr.json').then(m => m.default),
  en: () => import('../../i18n/messages/en.json').then(m => m.default),
  de: () => import('../../i18n/messages/de.json').then(m => m.default),
  fr: () => import('../../i18n/messages/fr.json').then(m => m.default)
};

export default async function LocaleLayout({children, params:{locale}}) {
  const key = (locale || 'tr').toLowerCase().split('-')[0];
  if (!SUPPORTED.includes(key)) notFound();

  const messages = await (dictionaries[key] ?? dictionaries.tr)();
  return (
    <NextIntlClientProvider locale={key} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
