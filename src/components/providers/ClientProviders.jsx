// src/components/providers/ClientProviders.jsx
"use client";

import { NextIntlClientProvider } from "next-intl";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { config } from "@/helpers/config";

//TODO: Production'da bu ID .env.local'e taşınacak.
const GOOGLE_CLIENT_ID =
  config.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function ClientProviders({ children, locale, messages }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Europe/Vienna" // ✅ Zorunlu eklendi
      >
        {children}
      </NextIntlClientProvider>
    </GoogleOAuthProvider>
  );
}
