// src/app/[locale]/layout.jsx
//"use client"; //this line caused error.

import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SUPPORTED = ["tr", "en", "de", "fr"];

const dict = {
  tr: () => import("../../i18n/messages/tr.json").then((m) => m.default),
  en: () => import("../../i18n/messages/en.json").then((m) => m.default),
  de: () => import("../../i18n/messages/de.json").then((m) => m.default),
  fr: () => import("../../i18n/messages/fr.json").then((m) => m.default),
};

const GOOGLE_CLIENT_ID = "1234567890-abcdef.apps.googleusercontent.com"; // 🔹 kendi client ID’n

export default async function LocaleLayout({ children, params }) {
  // Next 15: params bir Promise → await et
  const { locale: raw } = await params;

  // normalize + fallback
  const locale = (raw ?? "tr").toLowerCase().split("-")[0];
  if (!SUPPORTED.includes(locale)) notFound();

  const messages = await (dict[locale] || dict.tr)();

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="page-wrapper">
          <Header />
          <main className="content">{children}</main>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </GoogleOAuthProvider>
  );
}
