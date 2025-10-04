"use client"; // Next.js 13+ client component

import { MovieStripe } from "@/components/movies/MovieStripe";
import { useTranslations, useLocale } from "next-intl";


export default function HomePage() {
  const t = useTranslations("auth");
  const locale = useLocale();

  return (
    <div style={{ padding: 24 }}>
      <h2>
        {t("login")} – {locale}
      </h2>
      <MovieStripe />
    </div>
  );
}
