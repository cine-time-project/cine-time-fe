import "../styles/index.scss";
import Header from "../components/layout/Header";
import Footer from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";

const SUPPORTED = ["tr", "en", "de", "fr"];

const dictionaries = {
  tr: () => import("../i18n/messages/tr.json").then((m) => m.default),
  en: () => import("../i18n/messages/en.json").then((m) => m.default),
  de: () => import("../i18n/messages/de.json").then((m) => m.default),
  fr: () => import("../i18n/messages/fr.json").then((m) => m.default),
};

export const metadata = {
  title: "CineTime",
  description:
    "CineTime – En yeni filmleri keşfedin ve sinema biletinizi kolayca alın.",
  keywords: ["sinema", "bilet", "film", "vizyondakiler", "CineTime"],
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const key = (locale || "tr").toLowerCase().split("-")[0];

  if (!SUPPORTED.includes(key)) {
    notFound();
  }

  let messages;
  try {
    messages = await (dictionaries[key] ?? dictionaries.tr)();
  } catch (error) {
    console.warn(`⚠️ ${key} dil dosyası bulunamadı, Türkçe'ye düşülüyor.`);
    messages = await dictionaries.tr();
  }

  return (
    <html lang={key}>
      <body>
        <NextIntlClientProvider locale={key} messages={messages}>
          <div className="page-wrapper">
            <Header currentLocale={key} />
            <main className="content">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
