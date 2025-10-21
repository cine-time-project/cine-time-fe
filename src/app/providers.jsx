"use client";
import { NextIntlClientProvider } from "next-intl";
import { GoogleOAuthProvider } from "@react-oauth/google";
import FavoritesBoot from "@/components/bootstrap/FavoritesBoot";
import { config } from "@/helpers/config";

export default function Providers({ children, locale, messages }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone={config.i18n.timeZone}>
        <FavoritesBoot />   {/* site açılır açılmaz DB'den çek */}
        {children}
      </NextIntlClientProvider>
    </GoogleOAuthProvider>
  );
}
