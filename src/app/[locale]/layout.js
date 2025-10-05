// src/app/[locale]/layout.jsx
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SUPPORTED = ["tr", "en", "de", "fr"];

const dict = {
  tr: () => import("../../i18n/messages/tr.json").then(m => m.default),
  en: () => import("../../i18n/messages/en.json").then(m => m.default),
  de: () => import("../../i18n/messages/de.json").then(m => m.default),
  fr: () => import("../../i18n/messages/fr.json").then(m => m.default),
};

export default async function LocaleLayout({ children, params }) {
  const raw = params?.locale || "tr";
  const locale = raw.toLowerCase().split("-")[0];
  if (!SUPPORTED.includes(locale)) notFound();

  const messages = await (dict[locale] || dict.tr)();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="page-wrapper">
        <Header />
        <main className="content">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
