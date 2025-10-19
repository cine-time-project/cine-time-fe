// src/app/[locale]/layout.jsx
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/footer/Footer";
import ClientProviders from "@/components/providers/ClientProviders";

const SUPPORTED = ["tr", "en", "de", "fr"];

const dict = {
  tr: () => import("../../i18n/messages/tr.json").then((m) => m.default),
  en: () => import("../../i18n/messages/en.json").then((m) => m.default),
  de: () => import("../../i18n/messages/de.json").then((m) => m.default),
  fr: () => import("../../i18n/messages/fr.json").then((m) => m.default),
};

export default async function LocaleLayout({ children, params }) {
  // Next 15 ile uyumlu: params Promise olabilir
  const p = await Promise.resolve(params);
  const raw = p?.locale;
  const locale = (raw ?? "tr").toLowerCase().split("-")[0];

  if (!SUPPORTED.includes(locale)) notFound();

  const messages = await (dict[locale] || dict.tr)();

  return (
    <ClientProviders locale={locale} messages={messages}>
      <div className="page-wrapper">
        <Header />
        <main className="content">{children}</main>
        <Footer />
      </div>
    </ClientProviders>
  );
}
