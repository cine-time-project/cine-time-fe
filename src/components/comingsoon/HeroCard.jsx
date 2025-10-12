// src/components/comingsoon/HeroCard.jsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getHeroUrl } from "@/services/coming-soon-service";

export const HeroCard = ({ movie, slideNumber }) => {
  const t = useTranslations("comingSoon");
  const locale = useLocale();

  const imageUrl = getHeroUrl(movie);

  return (
    <div
      className="comingsoon-hero-card"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="comingsoon-hero-overlay" />

      {/* Slide number indicator (large background number) */}
      {slideNumber && (
        <div className="comingsoon-slide-number">{slideNumber}</div>
      )}

      {/* Optional: Play button for trailers */}
      {movie.trailerUrl && (
        <button
          className="comingsoon-hero-play-button"
          onClick={() => window.open(movie.trailerUrl, "_blank")}
          aria-label="Play trailer"
        />
      )}

      <div className="comingsoon-hero-content">
        <div className="comingsoon-hero-info">
          <div className="comingsoon-hero-meta">
            <span className="comingsoon-hero-tag">{t("heading")}</span>
            {movie.certification && (
              <span className="comingsoon-hero-badge">
                {movie.certification}
              </span>
            )}
          </div>

          <h2 className="comingsoon-hero-title">{movie.title}</h2>

          <p className="comingsoon-hero-date">
            {movie.releaseDate
              ? new Intl.DateTimeFormat(locale, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }).format(new Date(movie.releaseDate))
              : t("releaseTBA")}
          </p>
        </div>

        <div className="comingsoon-hero-buttons">
          <Link
            href={`/${locale}/buy-ticket?movieId=${movie.id}`}
            className="comingsoon-btn comingsoon-btn-outline"
          >
            {t("bookNow")}
          </Link>
          <Link
            href={`/${locale}/movie/${movie.slug || movie.id}`}
            className="comingsoon-btn comingsoon-btn-solid"
          >
            {t("details")}
          </Link>
        </div>
      </div>
    </div>
  );
};
