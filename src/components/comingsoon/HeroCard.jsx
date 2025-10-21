"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getHeroUrl } from "@/services/coming-soon-service";
import { FaPlayCircle } from "react-icons/fa";
import "./hero-carousel.scss";

export const HeroCard = ({ movie, slideNumber }) => {
  const t = useTranslations("comingSoon");
  const locale = useLocale();

  const imageUrl = getHeroUrl(movie) || movie?.posterUrl || movie?.backdropUrl;

  return (
    <div
      className="comingsoon-hero-card"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="comingsoon-hero-overlay" />

      {slideNumber && (
        <div className="comingsoon-slide-number">{slideNumber}</div>
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
          {movie.trailerUrl && (
            <button
              className="comingsoon-btn comingsoon-btn-outline"
              onClick={() => window.open(movie.trailerUrl, "_blank")}
              aria-label={t("trailer")}
              type="button"
            >
              <FaPlayCircle
                style={{
                  fontSize: 22,
                  marginRight: 8,
                  verticalAlign: "middle",
                }}
              />
              {t("trailer")}
            </button>
          )}
          <Link
            href={`/${locale}/movies/showtimes/${movie.id}`}
            className="comingsoon-btn comingsoon-btn-outline"
          >
            {t("bookNow")}
          </Link>
          <button
            className="comingsoon-btn comingsoon-btn-favorite"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // Add favorite functionality here
              console.log(`Toggle favorite for movie ${movie.id}`);
            }}
          >
            <span style={{ marginRight: 6 }}>♥</span>
            {t("favorite")}
          </button>
          <Link
            href={`/${locale}/movies/${movie.slug || movie.id}`}
            className="comingsoon-btn comingsoon-btn-solid"
          >
            {t("details")}
          </Link>
        </div>
      </div>
    </div>
  );
};
