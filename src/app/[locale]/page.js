"use client"; // Next.js 13+ client component

import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";
import { HeroCarousel } from "@/components/movies/hero-carousel/HeroCarousel";
import { MovieStripe } from "@/components/movies/movie-stripe/MovieStripe";
import { useTranslations, useLocale } from "next-intl";

export default function HomePage() {
  const t = useTranslations("movies");

  return (
    <div>
      <HeroCarousel query={"presale"} />

      <SectionTitle padding="px-5">
        {t("inTheaters")}
      </SectionTitle>
      <MovieStripe query={"in_theaters"} />
      <Spacer />
      <SectionTitle  padding="px-5">
        {t("comingSoon")}
      </SectionTitle>
      <MovieStripe query={"coming_soon"} />
      <Spacer />
      <SectionTitle  padding="px-5">
        {t("preSale")}
      </SectionTitle>
      <MovieStripe query={"presale"} />
      <Spacer />
    </div>
  );
}
