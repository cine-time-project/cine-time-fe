"use client"; // Next.js 13+ client component

import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";
import { HeroCarousel } from "@/components/movies/movie/hero-carousel/HeroCarousel";
import { MovieStripe } from "@/components/movies/movie/movie-stripe/MovieStripe";
import { useTranslations, useLocale } from "next-intl";

export default function HomePage() {
  const t = useTranslations("movies");
  const locale = useLocale();

  return (
    <div>
      <HeroCarousel query={"presale"}/>
      <div style={{ paddingLeft: 50, paddingRight: 50  }}>
        <SectionTitle>
          {t("inTheaters")} – {locale}
        </SectionTitle>
        <MovieStripe query={"in_theaters"} />
        <Spacer />
        <SectionTitle>
          {t("comingSoon")} – {locale}
        </SectionTitle>
        <MovieStripe query={"coming_soon"} />
        <Spacer />
        <SectionTitle>
          {t("preSale")} – {locale}
        </SectionTitle>
        <MovieStripe query={"presale"} />
      </div>
    </div>
  );
}
