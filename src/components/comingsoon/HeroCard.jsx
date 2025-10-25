"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getHeroUrl } from "@/services/coming-soon-service";
import { FaPlayCircle } from "react-icons/fa";
import { useFavorites } from "@/lib/hooks/useFavorites";
import "./hero-carousel.scss";

export const HeroCard = ({ movie, slideNumber }) => {
  const t = useTranslations("comingSoon");
  const locale = useLocale();
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites();

  const imageUrl = getHeroUrl(movie) || movie?.posterUrl || movie?.backdropUrl;
  const isMovieFavorite = isFavorite(movie.id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    if (!isLoggedIn) {
      console.log("User must be logged in to add favorites");
      return;
    }

    try {
      await toggleFavorite(movie);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

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
          {isLoggedIn && (
            <button
              className={`comingsoon-btn ${
                isMovieFavorite
                  ? "comingsoon-btn-favorite-active"
                  : "comingsoon-btn-favorite"
              }`}
              type="button"
              onClick={handleFavoriteClick}
              aria-label={
                isMovieFavorite ? t("removeFromFavorites") : t("addToFavorites")
              }
            >
              <span style={{ marginRight: 6 }}>
                {isMovieFavorite ? (
                  <i className="pi pi-check" style={{ color: "#ffee01ff" }} />
                ) : (
                  <i className="pi pi-plus" style={{ color: "#fff" }} />
                )}
              </span>
              {isMovieFavorite ? t("favorited") : t("favorite")}
            </button>
          )}
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
