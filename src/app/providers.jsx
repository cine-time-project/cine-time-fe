"use client";
import { NextIntlClientProvider } from "next-intl";

export default function Providers({ children, locale, messages }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone={config.i18n.timeZone} // <--- burayı ekledik
      >
        {children}
      </NextIntlClientProvider>
    </GoogleOAuthProvider>
  );
}
